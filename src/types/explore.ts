export type ExploreContentType = 'hotel' | 'restaurant' | 'activity'

export interface ExploreContent {
  id: number
  type: ExploreContentType
  name: string
  location: string
  category: string
  rating: number
  price: string
  image: string
  description: string
}