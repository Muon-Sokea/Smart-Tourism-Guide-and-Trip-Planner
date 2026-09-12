/** The five kinds of notification TravelGo sends. Flat DTO shape so a future
    backend response can map 1:1 onto these records. */
export type NotificationKind = 'trip' | 'booking' | 'reminder' | 'travel-update' | 'system'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  message: string
  /** ISO timestamp — lexicographically sortable, trivially mapped to a Date. */
  createdAt: string
  read: boolean
  /** In-app page to open when the notification is clicked. */
  link?: string
}
