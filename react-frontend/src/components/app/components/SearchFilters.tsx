import React, { useState, useEffect } from 'react'
import { Group, TextInput, ActionIcon } from '@mantine/core'
import { IconSearch, IconX } from '@tabler/icons-react'

interface SearchFiltersProps {
  search: string
  position: string
  sortBy: 'adp' | 'categories_points' | 'categories_rank' | 'points_league_points' | 'points_rank'
  sortOrder: 'asc' | 'desc'
  onSearchChange: (value: string) => void
  onPositionChange: (value: string) => void
  onSortChange: (sortBy: 'adp' | 'categories_points' | 'categories_rank' | 'points_league_points' | 'points_rank', sortOrder: 'asc' | 'desc') => void
  isLoading?: boolean
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  search,
  position,
  sortBy,
  sortOrder,
  onSearchChange,
  onPositionChange,
  onSortChange,
  isLoading = false
}) => {
  const [localSearch, setLocalSearch] = useState(search)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearch, onSearchChange])

  // Update local search when prop changes (e.g., on reset)
  useEffect(() => {
    setLocalSearch(search)
  }, [search])

  const handleClearSearch = () => {
    setLocalSearch('')
  }

  const positionOptions = [
    { value: 'ALL', label: 'All Positions' },
    { value: 'QB', label: 'Quarterback (QB)' },
    { value: 'RB', label: 'Running Back (RB)' },
    { value: 'WR', label: 'Wide Receiver (WR)' },
    { value: 'TE', label: 'Tight End (TE)' }
  ]

  const sortOptions = [
    { value: 'adp_asc', label: 'ADP (Best to Worst)' },
    { value: 'adp_desc', label: 'ADP (Worst to Best)' },
    { value: 'categories_points_desc', label: 'Categories Points (High to Low)' },
    { value: 'categories_points_asc', label: 'Categories Points (Low to High)' },
    { value: 'points_league_points_desc', label: 'Points League Points (High to Low)' },
    { value: 'points_league_points_asc', label: 'Points League Points (Low to High)' }
  ]

  const currentSortValue = `${sortBy}_${sortOrder}`

  const handleSortChange = (value: string | null) => {
    if (!value) return
    
    const parts = value.split('_')
    const newSortOrder = parts[parts.length - 1] as 'asc' | 'desc'
    const newSortBy = parts.slice(0, -1).join('_') as 'adp' | 'categories_points' | 'categories_rank' | 'points_league_points' | 'points_rank'
    onSortChange(newSortBy, newSortOrder)
  }

  return (
    <Group gap="md" wrap="wrap">
      {/* Search Input */}
      <TextInput
        placeholder="Search players..."
        value={localSearch}
        onChange={(e) => setLocalSearch(e.currentTarget.value)}
        leftSection={<IconSearch size={16} />}
        rightSection={
          localSearch ? (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={handleClearSearch}
              style={{ cursor: 'pointer' }}
            >
              <IconX size={14} />
            </ActionIcon>
          ) : null
        }
        disabled={isLoading}
        style={{ flex: 1, minWidth: 200 }}
      />

      {/* Position Filter */}
      <select
        value={position}
        onChange={(e) => onPositionChange(e.target.value)}
        disabled={isLoading}
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid var(--mantine-color-dark-4)',
          backgroundColor: 'var(--mantine-color-dark-6)',
          color: 'white',
          fontSize: '14px',
          minWidth: '160px'
        }}
      >
        {positionOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Sort Options */}
      <select
        value={currentSortValue}
        onChange={(e) => handleSortChange(e.target.value)}
        disabled={isLoading}
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid var(--mantine-color-dark-4)',
          backgroundColor: 'var(--mantine-color-dark-6)',
          color: 'white',
          fontSize: '14px',
          minWidth: '180px'
        }}
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Group>
  )
}
