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
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all
              ${activeCategory === category.filter
                ? 'bg-green-500 text-white'
                : 'bg-card text-muted-foreground hover:bg-card/80 border border-border hover:border-green-500/30'
              }
            `}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="text-sm sm:text-base">{category.name}</span>
          </button>
        ))}
      </div>

      {activeCategory !== 'all' && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Category filtering is coming soon. Currently showing all market news.
          </p>
        </div>
      )}
    </section>
  )
}
