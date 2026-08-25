<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string
    size?: number
  }>(),
  { size: 20 }
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </template>

    <template v-else-if="name === 'heart'">
      <path
        d="M12 21s-6.7-4.35-9.3-8.2C1 10 1.5 6.5 4.4 5 6.6 3.8 9 4.6 12 7.3 15 4.6 17.4 3.8 19.6 5c2.9 1.5 3.4 5 1.7 7.8C18.7 16.65 12 21 12 21Z"
      />
    </template>

    <template v-else-if="name === 'heart-filled'">
      <path
        d="M12 21s-6.7-4.35-9.3-8.2C1 10 1.5 6.5 4.4 5 6.6 3.8 9 4.6 12 7.3 15 4.6 17.4 3.8 19.6 5c2.9 1.5 3.4 5 1.7 7.8C18.7 16.65 12 21 12 21Z"
        fill="currentColor"
      />
    </template>

    <template v-else-if="name === 'star'">
      <polygon
        points="12 2 15.09 8.63 22 9.27 16.9 14.14 18.35 21 12 17.4 5.65 21 7.1 14.14 2 9.27 8.91 8.63 12 2"
        fill="currentColor"
        stroke="none"
      />
    </template>

    <template v-else-if="name === 'compass'">
      <circle cx="12" cy="12" r="9" />
      <polygon points="14.5 9.5 12.5 12.5 9.5 14.5 11.5 11.5 14.5 9.5" fill="currentColor" stroke="none" />
    </template>

    <template v-else-if="name === 'route'">
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="5" r="2" />
      <path d="M7 19h6a4 4 0 0 0 4-4V9a4 4 0 0 0-4-4" />
    </template>

    <template v-else-if="name === 'map'">
      <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z" />
      <line x1="9" y1="4" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="20" />
    </template>

    <template v-else-if="name === 'landmark'">
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="5" y1="21" x2="5" y2="10" />
      <line x1="19" y1="21" x2="19" y2="10" />
      <polygon points="12 3 21 8 3 8 12 3" />
      <line x1="9" y1="21" x2="9" y2="10" />
      <line x1="15" y1="21" x2="15" y2="10" />
    </template>

    <template v-else-if="name === 'waves'">
      <path d="M2 12c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
      <path d="M2 17c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
    </template>

    <template v-else-if="name === 'mountain'">
      <path d="M3 20 9 8l4 6 3-4 5 10H3Z" />
    </template>

    <template v-else-if="name === 'building'">
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <line x1="9" y1="7" x2="9" y2="7" />
      <line x1="9" y1="11" x2="9" y2="11" />
      <line x1="9" y1="15" x2="9" y2="15" />
      <line x1="15" y1="7" x2="15" y2="7" />
      <line x1="15" y1="11" x2="15" y2="11" />
      <line x1="15" y1="15" x2="15" y2="15" />
    </template>

    <template v-else-if="name === 'flag'">
      <line x1="5" y1="21" x2="5" y2="3" />
      <path d="M5 4h13l-3 4 3 4H5" />
    </template>

    <template v-else-if="name === 'utensils'">
      <path d="M6 3v7a2 2 0 0 0 2 2v9" />
      <path d="M6 3v7" />
      <path d="M9 3v7" />
      <path d="M18 3c-1.5 0-3 1.5-3 5s1.5 5 3 5v8" />
    </template>

    <template v-else-if="name === 'chevron-down'">
      <polyline points="6 9 12 15 18 9" />
    </template>

    <template v-else-if="name === 'filter'">
      <polygon points="4 4 20 4 14 12 14 19 10 21 10 12 4 4" />
    </template>

    <template v-else-if="name === 'x'">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </template>

    <template v-else-if="name === 'arrow-right'">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </template>

    <template v-else-if="name === 'map-pin'">
      <path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </template>

    <template v-else-if="name === 'plus'">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </template>

    <template v-else-if="name === 'trash'">
      <polyline points="3 6 5 6 21 6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </template>

    <template v-else-if="name === 'edit'">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </template>

    <template v-else-if="name === 'check'">
      <polyline points="20 6 9 17 4 12" />
    </template>

    <template v-else-if="name === 'calendar'">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </template>

    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </template>

    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </template>

    <template v-else-if="name === 'mail'">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </template>

    <template v-else-if="name === 'lock'">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </template>

    <template v-else-if="name === 'log-out'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </template>

    <template v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4.5" />
      <line x1="12" y1="19.5" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4.5" y2="12" />
      <line x1="19.5" y1="12" x2="22" y2="12" />
      <line x1="4.9" y1="4.9" x2="6.6" y2="6.6" />
      <line x1="17.4" y1="17.4" x2="19.1" y2="19.1" />
      <line x1="4.9" y1="19.1" x2="6.6" y2="17.4" />
      <line x1="17.4" y1="6.6" x2="19.1" y2="4.9" />
    </template>

    <template v-else-if="name === 'moon'">
      <path d="M20 14.5a8.5 8.5 0 1 1-9.5-11 7 7 0 0 0 9.5 11Z" />
    </template>

    <template v-else-if="name === 'plane'">
      <path
        d="M21 3 3 10.5l6.5 2 2 6.5L21 3Z"
        fill="currentColor"
        stroke="currentColor"
        stroke-linejoin="round"
      />
    </template>

    <template v-else-if="name === 'bookmark'">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
    </template>

    <template v-else-if="name === 'bookmark-filled'">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" fill="currentColor" />
    </template>

    <template v-else-if="name === 'bell'">
      <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16l-2-3Z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </template>
  </svg>
</template>
