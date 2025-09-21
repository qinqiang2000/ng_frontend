'use client';

import Header from '@/client/components/Header';

interface TranslationLoaderProps {
  loading: boolean;
  children: React.ReactNode;
  variant?: 'dashboard' | 'table' | 'simple';
}

export default function TranslationLoader({ loading, children, variant = 'dashboard' }: TranslationLoaderProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="px-6 py-8">
          {/* Page Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="h-9 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-28 animate-pulse"></div>
              </div>
            </div>

            {/* Render different skeletons based on variant */}
            {variant === 'dashboard' && (
              <>
                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>

                {/* Charts Section Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                    <div className="animate-pulse">
                      <div className="w-full h-64 bg-gray-200 rounded mb-4"></div>
                      <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
                            <div className="h-4 bg-gray-200 rounded flex-1"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                    <div className="w-full h-64 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Main Content Skeleton */}
          <div className="bg-white rounded-xl border border-gray-200">
            {/* Tab Skeleton */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="py-4 px-1">
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Filter Skeleton */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-9 bg-gray-200 rounded w-36 animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  <div className="h-9 bg-gray-200 rounded w-28 animate-pulse"></div>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-9 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="h-9 bg-gray-200 rounded w-9 animate-pulse"></div>
                  <div className="h-9 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>

              {/* Table Skeleton */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="w-12 py-3 px-6">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </th>
                      {Array.from({ length: 7 }).map((_, index) => (
                        <th key={index} className="text-left py-3 px-6">
                          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 8 }).map((_, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-gray-100">
                        <td className="py-4 px-6">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        {Array.from({ length: 7 }).map((_, colIndex) => (
                          <td key={colIndex} className="py-4 px-6">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            {colIndex === 1 && (
                              <div className="h-3 bg-gray-200 rounded w-2/3 mt-1 animate-pulse"></div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Skeleton */}
              <div className="flex items-center justify-between mt-6">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <>{children}</>;
}