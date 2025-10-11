
export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
     

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 py-16">
        <h1 className="text-5xl font-bold mb-10 text-center">About Prompt Craft</h1>

        {/* What is Prompt Craft */}
        <section className="max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-semibold mb-4">What is Prompt Craft?</h2>
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Prompt Craft</span> is a platform that
            treats <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
              prompts as code
            </span>.  
            We help developers and teams create, manage, and share structured
            JSON prompts for AI models—making them reusable, versioned, and
            production-ready.
          </p>
        </section>

        {/* Why Use Prompt Craft */}
        <section className="max-w-4xl text-center mb-16">
          <h2 className="text-3xl font-semibold mb-4">Why Use Prompt Craft?</h2>
          <ul className="list-disc list-inside text-lg text-gray-700 text-left mx-auto max-w-2xl space-y-2">
            <li>Version control for prompts, just like source code.</li>
            <li>Reusable prompt templates for consistent results.</li>
            <li>Collaboration features for teams.</li>
            <li>Easy integration with your AI workflows.</li>
            <li>Scalable management for production use cases.</li>
          </ul>
        </section>

        {/* How to Use Prompt Craft */}
        <section className="max-w-4xl text-center mb-16">
          <h2 className="text-3xl font-semibold mb-4">How to Use Prompt Craft?</h2>
          <ol className="list-decimal list-inside text-lg text-gray-700 text-left mx-auto max-w-2xl space-y-2">
            <li>Create and edit structured JSON prompts using our intuitive editor.</li>
            <li>Organize prompts into projects and folders.</li>
            <li>Share prompts with your team or the community.</li>
            <li>Integrate prompts into your applications via our API.</li>
            <li>Track changes and versions for reliable deployments.</li>
          </ol>
        </section>

        {/* Product Features */}
        <section className="max-w-4xl text-center mb-16">
          <h2 className="text-3xl font-semibold mb-4">Product Features & Use Cases</h2>
          <ul className="list-disc list-inside text-lg text-gray-700 text-left mx-auto max-w-2xl space-y-3">
            <li>
              <span className="font-semibold">Prompt Library:</span> Browse and reuse prompts across AI models.
            </li>
            <li>
              <span className="font-semibold">Team Collaboration:</span> Work together on prompt design and testing.
            </li>
            <li>
              <span className="font-semibold">Versioning:</span> Track changes and roll back when needed.
            </li>
            <li>
              <span className="font-semibold">API Integration:</span> Connect prompts to your apps and workflows.
            </li>
            <li>
              <span className="font-semibold">Use Cases:</span> Chatbots, content generation, data extraction, code generation, and more.
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="max-w-3xl text-center">
          <h2 className="text-3xl font-semibold mb-4">Get Started</h2>
          <p className="text-lg text-gray-700 mb-6">
            Sign up today to start crafting, managing, and deploying prompts like code.  
            Unlock the full potential of AI in your projects with{" "}
            <span className="font-semibold">Prompt Craft</span>.
          </p>
          <a
            href="/signup"
            className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition"
          >
            Start Crafting
          </a>
        </section>
      </main>
    </div>
  );
}
