import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

/**
 * Public share page - View prompt without authentication
 */
export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;


  const share = await prisma.publicPromptShare.findUnique({
    where: { slug },
    include: {
      prompt: {
        include: {
          creator: {
            select: {
              name: true,
              image: true,
            },
          },
          workspace: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Check if share exists and is active
  if (!share || !share.isActive) {
    notFound();
  }

  // Check if expired
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    notFound();
  }

  const { prompt } = share;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {prompt.name}
              </h1>
              {prompt.description && (
                <p className="text-gray-600 mb-4">{prompt.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  {prompt.creator.image && (
                    <img
                      src={prompt.creator.image}
                      alt={prompt.creator.name || 'Creator'}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span>
                    Created by {prompt.creator.name || 'Anonymous'}
                  </span>
                </div>
                <span>•</span>
                <span>Workspace: {prompt.workspace.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TOON Code */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">TOON Code</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{prompt.toon}</code>
          </pre>
        </div>

        {/* JSON Preview */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">JSON Output</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{JSON.stringify(prompt.json, null, 2)}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            This is a publicly shared prompt from{' '}
            <span className="font-semibold">Prompt Craft</span>
          </p>
          {share.expiresAt && (
            <p className="mt-1">
              Expires on {new Date(share.expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
