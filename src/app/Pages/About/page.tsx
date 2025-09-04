import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";



<Terminal>
        <TypingAnimation>&gt; pnpm dlx prompt-craft@latest init</TypingAnimation>

        <AnimatedSpan className="text-green-500">✔ Initializing Prompt Craft Labs...</AnimatedSpan>

        <AnimatedSpan className="text-green-500">
          ✔ Setting up workspace: /prompts
        </AnimatedSpan>

        <AnimatedSpan className="text-green-500">
          ✔ Generating template: content.json
        </AnimatedSpan>

        <AnimatedSpan className="text-green-500">
          ✔ Generating template: website.json
        </AnimatedSpan>

        <AnimatedSpan className="text-green-500">
          ✔ Generating template: database.json
        </AnimatedSpan>

        <TypingAnimation className="text-muted-foreground">
          {"✅ Success! Your Prompt Lab is ready. Edit /prompts/*.json to craft and export."}
        </TypingAnimation>
      </Terminal>

