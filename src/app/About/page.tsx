export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-8">
            <h1 className="text-5xl font-bold mb-6">About Prompt Craft</h1>
            <section className="max-w-3xl text-center mb-8">
                <h2 className="text-2xl font-semibold mb-4">What is Prompt Craft?</h2>
                <p className="text-lg text-gray-700 mb-4">
                    Prompt Craft is a platform designed to help developers and teams create, manage, and share structured JSON prompts for AI models. It treats prompts as code—making them reusable, versioned, and scalable for production environments.
                </p>
            </section>
            <section className="max-w-3xl text-center mb-8">
                <h2 className="text-2xl font-semibold mb-4">Why Use Prompt Craft?</h2>
                <ul className="list-disc list-inside text-lg text-gray-700 mb-4 text-left mx-auto max-w-xl">
                    <li>Version control for prompts, just like source code.</li>
                    <li>Reusable prompt templates for consistent results.</li>
                    <li>Collaboration features for teams.</li>
                    <li>Easy integration with your AI workflows.</li>
                    <li>Scalable management for production use cases.</li>
                </ul>
            </section>
            <section className="max-w-3xl text-center mb-8">
                <h2 className="text-2xl font-semibold mb-4">How to Use Prompt Craft?</h2>
                <ol className="list-decimal list-inside text-lg text-gray-700 mb-4 text-left mx-auto max-w-xl">
                    <li>Create and edit structured JSON prompts using our intuitive editor.</li>
                    <li>Organize prompts into projects and folders.</li>
                    <li>Share prompts with your team or the community.</li>
                    <li>Integrate prompts into your applications via our API.</li>
                    <li>Track changes and versions for reliable deployments.</li>
                </ol>
            </section>
            <section className="max-w-3xl text-center mb-8">
                <h2 className="text-2xl font-semibold mb-4">Product Features & Use Cases</h2>
                <ul className="list-disc list-inside text-lg text-gray-700 text-left mx-auto max-w-xl">
                    <li>
                        <span className="font-semibold">Prompt Library:</span> Browse and reuse a wide variety of prompts for different AI models.
                    </li>
                    <li>
                        <span className="font-semibold">Team Collaboration:</span> Work together on prompt design and testing.
                    </li>
                    <li>
                        <span className="font-semibold">Versioning:</span> Keep track of prompt changes and roll back when needed.
                    </li>
                    <li>
                        <span className="font-semibold">API Integration:</span> Seamlessly connect your prompts to your apps and workflows.
                    </li>
                    <li>
                        <span className="font-semibold">Use Cases:</span> Chatbots, content generation, data extraction, code generation, and more.
                    </li>
                </ul>
            </section>
            <section className="max-w-3xl text-center">
                <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
                <p className="text-lg text-gray-700">
                    Sign up today to start crafting, managing, and deploying prompts like code. Unlock the full potential of AI in your projects with Prompt Craft.
                </p>
            </section>
        </main>
    );
}
