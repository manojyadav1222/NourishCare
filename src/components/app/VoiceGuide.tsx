import { Link } from "@tanstack/react-router";
import { Bot, Languages, Loader2, Mic, MicOff, Send, Sparkles, Volume2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { assistantApi, type AssistantAction } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionEventLike = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const LANGUAGE_OPTIONS = [
  { value: "en-IN", label: "English" },
  { value: "hi-IN", label: "Hindi / हिंदी" },
  { value: "te-IN", label: "Telugu / తెలుగు" },
  { value: "ta-IN", label: "Tamil / தமிழ்" },
];

const DEFAULT_STARTER_PROMPTS = [
  "What should I eat for protein?",
  "Calculate BMI for height 170 and weight 70",
  "Show iron-rich foods",
];

const STARTER_PROMPTS: Record<string, string[]> = {
  "en-IN": DEFAULT_STARTER_PROMPTS,
  "hi-IN": [
    "Protein ke liye kya khau?",
    "Height 170 weight 70 ka BMI batao",
    "Iron rich foods dikhao",
  ],
  "te-IN": ["Protein kosam emi tināli?", "Height 170 weight 70 BMI cheppu", "Iron foods chupinchu"],
  "ta-IN": ["Protein ku enna sapidanum?", "Height 170 weight 70 BMI sollu", "Iron foods kaatu"],
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export function VoiceGuide() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("en-IN");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "Ask me about nutrition, BMI, water, healthy habits, meal plans or Nourish Market foods. I can reply in English, Hindi, Telugu or Tamil.",
  );
  const [actions, setActions] = useState<AssistantAction[]>([
    { label: "Open Nourish Market", to: "/market" },
    { label: "Create meal plan", to: "/meal-planner" },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_STARTER_PROMPTS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const speechSupported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }, []);

  async function askAssistant(nextQuestion = question) {
    const cleanQuestion = nextQuestion.trim();
    if (!cleanQuestion) {
      toast.error("Please ask a question first.");
      return;
    }

    setLoading(true);
    try {
      const result = await assistantApi.chat({ message: cleanQuestion, language });
      setAnswer(result.answer);
      setActions(result.actions);
      setSuggestions(
        result.suggestions?.length
          ? result.suggestions
          : (STARTER_PROMPTS[language] ?? DEFAULT_STARTER_PROMPTS),
      );
      setMessages((items) => [
        ...items.slice(-5),
        { role: "user", text: cleanQuestion },
        { role: "assistant", text: result.answer },
      ]);
      setQuestion("");
      speak(result.answer, result.language);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Assistant is unavailable right now.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function speak(text = answer, lang = language) {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Voice playback is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function startListening() {
    if (!speechSupported) {
      toast.error("Speech input works best in Chrome. You can type your question instead.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setQuestion(transcript);
        void askAssistant(transcript);
      }
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error("I could not hear clearly. Please try again or type your question.");
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return (
    <TooltipProvider>
      <Sheet open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full shadow-xl shadow-primary/25"
                size="icon"
                aria-label="Open NourishCare voice guide"
              >
                <Bot className="h-6 w-6" />
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">NourishCare voice guide</TooltipContent>
        </Tooltip>

        <SheetContent
          side="right"
          className="flex w-full flex-col gap-5 overflow-y-auto sm:max-w-md"
        >
          <SheetHeader className="pr-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <SheetTitle className="font-display text-2xl">NourishCare Voice Guide</SheetTitle>
            <SheetDescription>
              Ask in English, Hindi, Telugu or Tamil for quick nutrition guidance.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-2">
            <Label htmlFor="voice-language" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Local language
            </Label>
            <Select
              value={language}
              onValueChange={(value) => {
                setLanguage(value);
                setSuggestions(STARTER_PROMPTS[value] ?? DEFAULT_STARTER_PROMPTS);
              }}
            >
              <SelectTrigger id="voice-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-4">
            <p className="text-sm leading-6 text-foreground">{answer}</p>
          </div>

          {messages.length ? (
            <div className="max-h-52 space-y-2 overflow-y-auto rounded-2xl border bg-background p-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={
                    message.role === "user"
                      ? "ml-8 rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "mr-8 rounded-2xl bg-muted px-3 py-2 text-sm leading-5 text-foreground"
                  }
                >
                  {message.text}
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button key={`${action.label}-${action.to}`} asChild variant="secondary" size="sm">
                <Link to={action.to}>{action.label}</Link>
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            <Label htmlFor="assistant-question">Ask a question</Label>
            <div className="flex gap-2">
              <Input
                id="assistant-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Example: show protein-rich foods"
                onKeyDown={(event) => {
                  if (event.key === "Enter") void askAssistant();
                }}
              />
              <Button
                type="button"
                size="icon"
                disabled={loading}
                onClick={() => void askAssistant()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Ask</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={listening ? "destructive" : "outline"}
              onClick={listening ? stopListening : startListening}
            >
              {listening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
              {listening ? "Stop" : "Speak"}
            </Button>
            <Button type="button" variant="outline" onClick={() => speak()}>
              <Volume2 className="mr-2 h-4 w-4" />
              Play answer
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Try asking
            </p>
            <div className="grid gap-2">
              {suggestions.map((prompt) => (
                <Button
                  key={prompt}
                  type="button"
                  variant="ghost"
                  className="justify-start text-left"
                  onClick={() => void askAssistant(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          <p className="mt-auto rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            Educational guide only. For illness, pregnancy, medicines, allergies or urgent symptoms,
            talk to a qualified health professional.
          </p>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
