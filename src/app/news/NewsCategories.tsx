'use client'

import { useState } from 'react'

interface Category {
  name: string
  filter: string
  icon: string
}

interface NewsCategoriesProps {
  categories: Category[]
}

export default function NewsCategories({ categories }: NewsCategoriesProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.filter}
            onClick={() => setActiveCategory(category.filter)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]
              ${activeCategory === category.filter
                ? 'bg-[#4ebe96] text-white'
                : 'bg-white/[0.03] backdrop-blur-[10px] text-[#868f97] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.15]'
              }
            `}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="text-sm sm:text-base">{category.name}</span>
          </button>
        ))}
      </div>

      {activeCategory !== 'all' && (
        <div className="mt-4 p-3 bg-[#4ebe96]/10 border border-[#4ebe96]/20 rounded-2xl">
          <p className="text-sm text-[#868f97]">
            Category filtering is coming soon. Currently showing all market news.
          </p>
        </div>
      )}
    </section>
  )
}
