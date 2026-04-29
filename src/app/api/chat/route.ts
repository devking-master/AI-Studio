import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";
import { dbConnect } from "@/lib/dbConnect";
import { Chat } from "@/model/Chat";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId, userId, title, model: requestedModel, userName } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages must be an array", { status: 400 });
    }

    if (!userId) {
      return new Response("User ID is required", { status: 400 });
    }

    await dbConnect();

    let modelProvider;
    const modelId = requestedModel || "llama-3.3-70b-versatile";
    
    console.log(`Processing chat request with model: ${modelId}`);

    if (modelId.startsWith("gpt")) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key is missing");
      }
      modelProvider = openai(modelId);
    } else {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("Groq API key is missing");
      }
      modelProvider = groq(modelId);
    }

    const formattedMessages: any[] = messages.map(
      (msg: any) => {
        const content: any[] = [{ type: "text", text: msg.content }];
        
        // Add images if present (GPT-4o only for now)
        if (msg.attachments && modelId.startsWith("gpt")) {
          msg.attachments.forEach((att: any) => {
            if (att.type === "image") {
              content.push({ type: "image", image: att.url });
            }
          });
        }

        return {
          role: msg.role,
          content: content.length === 1 ? msg.content : content,
        };
      }
    );

    try {
      const result = streamText({
        model: modelProvider,
        messages: formattedMessages,
        system:
          `You are AI Studio, a premium AI assistant. The user's name is ${userName || 'User'}. Address them naturally when appropriate. Provide clear, concise, and accurate responses. You can analyze images if using a GPT-4o model.`,
        async onFinish({ text: assistantResponse }) {
          // Save the chat with both user and assistant messages to MongoDB
          try {
            const userMessage = messages[messages.length - 1];
            const messageData = {
              role: "user",
              content: userMessage.content,
              attachments: userMessage.attachments,
              timestamp: new Date(),
            };
            const assistantData = {
              role: "assistant",
              content: assistantResponse,
              timestamp: new Date(),
            };

            if (chatId) {
              await Chat.findByIdAndUpdate(
                chatId,
                {
                  $push: {
                    messages: [messageData, assistantData],
                  },
                },
                { new: true }
              );
            } else {
              await Chat.create({
                userId,
                title: title || userMessage.content.substring(0, 30),
                messages: [messageData, assistantData],
              });
            }
          } catch (dbError) {
            console.error("Error saving chat to MongoDB:", dbError);
          }
        },
      });

      // Handle streaming response
      return result.toTextStreamResponse();
    } catch (modelError: any) {
      console.error(`Error with model ${modelId}:`, modelError);
      return new Response(
        JSON.stringify({ 
          error: `Model error: ${modelError.message || "The AI model failed to respond. Please try again or switch to a different model."}` 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
