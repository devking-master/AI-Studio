"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Plus, Trash2, MessageCircle, Settings, Sparkles, 
  Crown, ArrowRight, Paperclip, X, Image as ImageIcon, 
  Film, FileText, ChevronDown, LogOut, Check, Search, 
  Edit3, Menu, Moon, Sun, Lock, MoreVertical, ChevronUp,
  PanelLeftClose, PanelLeft
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Attachment {
  url: string;
  type: "image" | "video" | "file";
  name: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", color: "text-orange-400", premium: false },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", color: "text-emerald-400", premium: true },
  { id: "qwen/qwen3-32b", name: "Qwen 3 32B", color: "text-blue-400", premium: true },
];

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [user, setUser] = useState<{ userId: string; email: string; tier: string; displayName?: string; subscriptionExpiresAt?: string } | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [tempName, setTempName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light";
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 768);
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          if (!data.displayName) {
            setShowNamePrompt(true);
          }
        } else {
          window.location.href = "/login";
        }
      } catch (err) {
        window.location.href = "/login";
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.userId) {
      loadChats(user.userId);
    }
    
    // Check subscription expiration
    if (user?.subscriptionExpiresAt && user.tier !== "Basic") {
      const expiresAt = new Date(user.subscriptionExpiresAt);
      const now = new Date();
      const diffTime = expiresAt.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 3 && diffDays > 0) {
        toast.warning(`Subscription Alert`, {
          description: `Your ${user.tier} plan expires in ${diffDays} day${diffDays > 1 ? "s" : ""}. Upgrade now to keep Pro features!`,
          duration: 10000,
        });
      } else if (diffDays === 0) {
        toast.error(`Subscription Ending`, {
          description: `Your ${user.tier} plan expires today! Renew now to keep Pro features.`,
          duration: 10000,
        });
      }
    }
  }, [user]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    setSavingName(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: tempName })
      });
      if (res.ok) {
        setUser(prev => prev ? { ...prev, displayName: tempName.trim() } : null);
        setShowNamePrompt(false);
        toast.success("Nice to meet you!");
      } else {
        toast.error("Failed to save name");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSavingName(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChats = async (userId: string) => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/chats?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to load chats");
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`);
      if (!response.ok) throw new Error("Failed to load chat");
      const data = await response.json();
      setCurrentChatId(chatId);
      setMessages(
        data.messages.map((msg: any, index: number) => ({
          id: `${index}-${Date.now()}`,
          role: msg.role,
          content: msg.content,
          attachments: msg.attachments,
          timestamp: new Date(msg.timestamp),
        }))
      );
      if (isMobile) setIsSidebarOpen(false);
    } catch (error) {
      toast.error("Failed to load conversation");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setIsUploadMenuOpen(false);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setAttachments((prev) => [...prev, data]);
        toast.success("File uploaded successfully");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed. Please check your connection.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    if (selectedModel.premium && (!user?.tier || user.tier === "Basic")) {
      toast.error("Pro Model Locked", {
        description: "Please upgrade your plan to use this model.",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      attachments: attachments,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setLoading(true);

    let chatIdToUse = currentChatId;

    // If it's a new chat, create it first to get an ID
    if (!chatIdToUse) {
      try {
        const createRes = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.userId,
            title: input.substring(0, 30),
          }),
        });
        if (createRes.ok) {
          const newChat = await createRes.json();
          chatIdToUse = newChat._id;
          setCurrentChatId(chatIdToUse);
        }
      } catch (err) {
        console.error("Failed to create new chat record:", err);
      }
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          chatId: chatIdToUse,
          userId: user?.userId,
          userName: user?.displayName,
          model: selectedModel.id,
          title: messages.length === 0 ? input.substring(0, 30) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        assistantContent += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1].role === assistantMessage.role && newMessages[newMessages.length - 1].id === assistantMessage.id) {
            newMessages[newMessages.length - 1].content = assistantContent;
          }
          return newMessages;
        });
      }
      if (user?.userId) await loadChats(user.userId);
    } catch (error: any) {
      // Remove the assistant message if it was added but the request failed
      setMessages((prev) => prev.filter(msg => msg.content !== "" || msg.role !== "assistant"));
      toast.error(error.message || "AI failed to respond. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRenameChat = async (chatId: string) => {
    if (!renameValue.trim()) return;
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue }),
      });
      if (response.ok) {
        setChats(chats.map(c => c._id === chatId ? { ...c, title: renameValue } : c));
        setRenamingChatId(null);
        toast.success("Chat renamed");
      }
    } catch (err) {
      toast.error("Failed to rename chat");
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      const response = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
      if (response.ok) {
        if (currentChatId === chatId) {
          setMessages([]);
          setCurrentChatId(null);
        }
        setChats(chats.filter(c => c._id !== chatId));
        toast.success("Chat deleted");
      }
    } catch (err) {
      toast.error("Failed to delete chat");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const filteredChats = useMemo(() => {
    return chats.filter(c => c.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [chats, searchQuery]);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed md:relative top-0 left-0 z-50 h-full bg-sidebar border-border flex flex-col transition-all duration-300 overflow-hidden ${
          isSidebarOpen 
            ? 'w-80 translate-x-0 p-6 border-r' 
            : 'w-80 -translate-x-full md:w-0 md:translate-x-0 md:p-0 md:border-r-0 p-6 border-r'
        }`}
      >
        <div className="flex items-center justify-between mb-8 px-2 min-w-max">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shadow-lg shrink-0">
              <Sparkles className="w-5 h-5 text-background" />
            </div>
            <span className="font-bold text-xl tracking-tight">AI Studio</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <PanelLeftClose className="w-5 h-5 hidden md:block" />
            <X className="w-5 h-5 md:hidden" />
          </button>
        </div>

        <motion.button
          onClick={() => { setMessages([]); setCurrentChatId(null); if (isMobile) setIsSidebarOpen(false); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-foreground text-background rounded-2xl mb-6 font-bold shadow-lg shadow-black/5 overflow-hidden whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          New Thread
        </motion.button>

        {/* Search Chats */}
        <div className="relative mb-6 px-1 overflow-hidden">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto mb-6 space-y-1 custom-scrollbar pr-2">
          <AnimatePresence mode="popLayout">
            {historyLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full bg-black/5 dark:bg-white/5 rounded-xl mb-2 animate-pulse" />
              ))
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-10 opacity-30">
                <MessageCircle className="w-10 h-10 mx-auto mb-2" />
                <p className="text-xs font-bold">No threads</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div key={chat._id} className="group relative">
                  {renamingChatId === chat._id ? (
                    <div className="flex items-center gap-2 px-2 py-1 bg-background border border-accent rounded-xl">
                      <input 
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameChat(chat._id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameChat(chat._id)}
                        className="flex-1 bg-transparent text-sm outline-none py-2"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => loadChat(chat._id)}
                      className={`w-full text-left px-4 py-3 rounded-xl truncate transition-all duration-200 group border ${
                        currentChatId === chat._id
                          ? "bg-foreground/5 text-foreground border-border shadow-sm font-medium"
                          : "text-muted-foreground border-transparent hover:bg-foreground/5 hover:text-foreground"
                      }`}
                    >
                      {chat.title || "Untitled Chat"}
                    </button>
                  )}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setRenamingChatId(chat._id); setRenameValue(chat.title); }} className="p-1.5 text-muted-foreground hover:text-foreground">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteChat(chat._id)} className="p-1.5 text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropup */}
        <div className="relative mt-auto border-t border-border pt-6">
          <AnimatePresence>
            {isProfileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 mb-4 w-full bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-border bg-foreground/5">
                    <p className="text-sm font-bold truncate">{user?.email}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{user?.tier} Plan</p>
                  </div>
                  <div className="p-2">
                    <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-foreground/5 rounded-xl transition-all text-sm font-medium">
                      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <Link href="/pricing" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-foreground/5 rounded-xl transition-all text-sm font-medium">
                      <Crown className="w-4 h-4 text-accent" />
                      Upgrade Plan
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 text-red-500 rounded-xl transition-all text-sm font-medium mt-1">
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-full flex items-center gap-3 p-3 bg-foreground/5 rounded-2xl border border-border hover:border-accent/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center font-bold shadow-md">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0 flex flex-col items-start justify-center gap-1">
              <p className="text-sm font-bold truncate w-full">{user?.displayName || user?.email?.split('@')[0]}</p>
              <div className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md border flex items-center justify-center ${
                user?.tier === "Premium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                user?.tier === "Pro+" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                user?.tier === "Pro" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : 
                "bg-foreground/5 text-muted-foreground border-border"
              }`}>
                {user?.tier} Plan
              </div>
            </div>
            <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </motion.aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative bg-background min-w-0">
        
        {/* Floating Toggle Button for Desktop when Sidebar is closed */}
        {!isSidebarOpen && !isMobile && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 z-40 p-2.5 bg-sidebar border border-border rounded-xl shadow-sm hover:shadow-md hover:bg-foreground/5 transition-all text-muted-foreground hover:text-foreground group"
          >
            <PanelLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Mobile Header */}
        <header className="h-16 md:hidden flex items-center justify-between px-6 border-b border-border z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-foreground/5 rounded-xl">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm tracking-tight">AI Studio</span>
          <button onClick={() => { setMessages([]); setCurrentChatId(null); }} className="p-2 hover:bg-foreground/5 rounded-xl">
            <Plus className="w-5 h-5" />
          </button>
        </header>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-10 md:px-12 space-y-10 custom-scrollbar pb-40">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 bg-foreground/5 rounded-3xl flex items-center justify-center mb-8 border border-border">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-4">What's on your mind?</h2>
              <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                Choose a model and start a conversation. I'm here to help with code, creative writing, or any complex questions you have.
              </p>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-10">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] md:max-w-[75%] space-y-3 ${message.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`px-6 py-4 rounded-[24px] shadow-sm ${
                        message.role === "user"
                          ? "bg-foreground text-background font-medium"
                          : "bg-sidebar border border-border text-foreground"
                      }`}
                    >
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {message.attachments.map((att, i) => (
                            <div key={i} className="rounded-xl overflow-hidden border border-black/10">
                              {att.type === "image" ? (
                                <img src={att.url} className="max-w-[200px] max-h-[200px] object-cover" />
                              ) : (
                                <div className="flex items-center gap-2 p-3 bg-black/5 rounded-xl text-sm font-bold">
                                  <FileText className="w-4 h-4" />
                                  <span className="truncate max-w-[100px]">{att.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="leading-relaxed whitespace-pre-wrap text-[15px] md:text-[16px]">
                        {message.content}
                      </p>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-30 px-2">
                      {message.role === "user" ? "You" : "AI Studio"} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-sidebar border border-border rounded-2xl px-6 py-4">
                    <Loader2 className="w-6 h-6 text-accent" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar Section */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            
            {/* Attachment Previews */}
            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="flex flex-wrap gap-3 mb-4 p-4 bg-sidebar/80 backdrop-blur-xl border border-border rounded-3xl"
                >
                  {attachments.map((att, i) => (
                    <div key={i} className="relative group">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-border">
                        {att.type === 'image' ? <img src={att.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-black/5"><FileText className="w-6 h-6" /></div>}
                      </div>
                      <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSendMessage} className="relative flex flex-col gap-2">
              <div className="relative group bg-sidebar border border-border rounded-[32px] p-2 transition-all shadow-2xl">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Upload Options */}
                    <div className="relative flex-shrink-0">
                      <button 
                        type="button" 
                        onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
                        className="p-4 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Paperclip className="w-6 h-6" />
                      </button>
                      <AnimatePresence>
                        {isUploadMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsUploadMenuOpen(false)} />
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                              className="absolute bottom-full left-0 mb-4 w-48 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden p-2"
                            >
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-3 hover:bg-foreground/5 rounded-xl transition-all text-sm font-bold">
                                <ImageIcon className="w-4 h-4 text-blue-500" /> Image
                              </button>
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-3 hover:bg-foreground/5 rounded-xl transition-all text-sm font-bold">
                                <Film className="w-4 h-4 text-purple-500" /> Video
                              </button>
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 p-3 hover:bg-foreground/5 rounded-xl transition-all text-sm font-bold">
                                <FileText className="w-4 h-4 text-orange-500" /> File
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask anything..."
                      className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0 text-foreground py-4 text-lg placeholder:text-muted-foreground"
                      disabled={loading}
                    />
                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'any')} className="hidden" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-end flex-shrink-0 w-full sm:w-auto">
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-foreground/5 transition-all"
                      >
                        <span className={`text-xs font-black uppercase tracking-widest ${selectedModel.color}`}>{selectedModel.name.split(' ')[0]}</span>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </button>
                      <AnimatePresence>
                        {isModelMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsModelMenuOpen(false)} />
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                              className="absolute bottom-full right-0 mb-4 w-56 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden p-2"
                            >
                              {MODELS.map(m => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => { if(!m.premium || (user?.tier && user.tier !== 'Basic')) { setSelectedModel(m); setIsModelMenuOpen(false); } else { toast.error("Upgrade to Pro to use this model"); } }}
                                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedModel.id === m.id ? 'bg-foreground/5' : 'hover:bg-foreground/5'} ${m.premium && (!user?.tier || user.tier === 'Basic') ? 'opacity-50' : ''}`}
                                >
                                  <div className="flex flex-col items-start">
                                    <span className={`text-sm font-bold ${m.color}`}>{m.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{m.premium ? 'Pro Model' : 'Standard'}</span>
                                  </div>
                                  {m.premium && (!user?.tier || user.tier === 'Basic') ? <Lock className="w-3 h-3 text-muted-foreground" /> : selectedModel.id === m.id && <Check className="w-4 h-4" />}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading || (!input.trim() && attachments.length === 0)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 bg-foreground text-background rounded-2xl flex items-center justify-center disabled:opacity-20 transition-all shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </form>
            <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-[0.4em] font-black opacity-30">
              AI Studio • Secure Contextual Memory Enabled
            </p>
          </div>
        </div>
      </main>

      {/* Name Prompt Modal */}
      <AnimatePresence>
        {showNamePrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-foreground/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                
                <h2 className="text-3xl font-black tracking-tight mb-2">Welcome to AI Studio</h2>
                <p className="text-muted-foreground text-[15px] mb-8 font-medium">
                  What should I call you?
                </p>

                <form onSubmit={handleSaveName} className="w-full space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full bg-background border border-border rounded-2xl px-5 py-4 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-muted-foreground/50 placeholder:font-medium"
                      disabled={savingName}
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={!tempName.trim() || savingName}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded-2xl font-bold text-[15px] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/5"
                  >
                    {savingName ? (
                      <Loader2 className="w-5 h-5" />
                    ) : (
                      <>
                        Let's Go
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={className}
    >
      <Sparkles className="w-full h-full" />
    </motion.div>
  );
}
