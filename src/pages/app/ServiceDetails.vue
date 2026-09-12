<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFavorites } from '../../composables/useFavorites'
import { useTripPlanner } from '../../composables/useTripPlanner'
import { serviceCatalog, findService, serviceAvailability, serviceLabel } from '../../utils/serviceCatalog'
import { useGeocodedPoint } from '../../utils/geocode'
import RatingDisplay from '../../components/explore/RatingDisplay.vue'
import ExploreContentCard from '../../components/explore/ExploreContentCard.vue'
import PlaceMap from '../../components/explore/PlaceMap.vue'
import Button from '../../components/common/Button.vue'
import Icon from '../../components/common/Icon.vue'

const route = useRoute()
const { isFavorite, toggleFavorite } = useFavorites()
const { addPlace, isPlaceInTrip, showPlaceAdded, lastAddedMessage } = useTripPlanner()
const type = computed<'hotel' | 'restaurant' | 'activity'>(() => {
  const routeType = route.params.type
  return routeType === 'hotel' || routeType === 'restaurant' || routeType === 'activity' ? routeType : 'activity'
})
const service = computed(() => findService(type.value, Number(route.params.id)))
const availability = computed(() => service.value ? serviceAvailability(service.value) : 'Not Available')
const reviewCount = computed(() => service.value ? 32 + (service.value.id % 93) : 0)
const rating = computed(() => service.value?.rating || 0)
const displayPrice = computed(() => service.value?.price || 'Price unavailable')
const isDescriptionExpanded = ref(false)
const areReviewsExpanded = ref(false)
const selectedImage = ref('')
const sampleReviews = [
  { name: 'Maya Chen', initials: 'MC', title: 'Great experience', text: 'A memorable choice with thoughtful service and a location that made exploring simple.' },
  { name: 'Daniel Brooks', initials: 'DB', title: 'Very good service', text: 'Everything was clear before arrival, and the experience matched the description.' },
  { name: 'Sofia Martinez', initials: 'SM', title: 'A comfortable stay', text: 'The team was welcoming, the details were easy to understand, and the place felt well cared for.' },
  { name: 'Ethan Wilson', initials: 'EW', title: 'Would recommend', text: 'A convenient choice for travelers who want a smooth and enjoyable experience.' },
]
const relatedServices = computed(() => serviceCatalog.filter((item) => item.type === type.value && item.id !== service.value?.id).slice(0, 3))
/* Any hotel/restaurant/activity can join the trip: the itinerary stores the
   service in its own id range so it shows up in the same planner as destinations. */
const canAddToTrip = computed(() => Boolean(service.value))
const isInTrip = computed(() => (service.value ? isPlaceInTrip(type.value, service.value.id) : false))
const galleryImages = computed(() => service.value ? [service.value, ...relatedServices.value] : [])
const mainImage = computed(() => selectedImage.value || service.value?.image || '')

/* Real per-service map: geocode the service's own location string so every
   hotel/restaurant/activity shows its actual place, not one fixed position. */
const { point: servicePoint, isLoading: isLocating, resolve: resolveServicePoint } = useGeocodedPoint(() => service.value?.location || '')
onMounted(() => {
  void resolveServicePoint()
})
watch(() => service.value?.location, () => {
  void resolveServicePoint()
})

const typeConfig = computed(() => {
  if (type.value === 'hotel') return {
    icon: 'building', heading: 'About This Place', bookingAction: 'Book Now', unit: '/ night',
    features: ['Wi-Fi', 'Breakfast', 'Swimming Pool', 'Parking', 'Air Conditioning', 'Restaurant'],
    info: [{ label: 'Check-in', value: '2:00 PM', icon: 'clock' }, { label: 'Check-out', value: '12:00 PM', icon: 'clock' }, { label: 'Rooms', value: '48 rooms', icon: 'building' }, { label: 'Location', value: service.value?.location || '', icon: 'map-pin' }],
    roomTypes: [{ name: 'Standard Room', price: service.value?.price || '$85 / night' }, { name: 'Deluxe Room', price: '$120 / night' }, { name: 'Suite', price: '$180 / night' }],
    availabilityTitle: 'Available Rooms', availabilityItems: ['Standard Room', 'Deluxe Room', 'Suite'],
  }
  if (type.value === 'restaurant') return {
    icon: 'utensils', heading: 'About This Place', bookingAction: 'Reserve Table', unit: 'per guest',
    features: ['Outdoor Seating', 'Wi-Fi', 'Parking', 'Takeaway', 'Reservation'],
    info: [{ label: 'Cuisine', value: service.value?.category || 'Local cuisine', icon: 'utensils' }, { label: 'Price range', value: service.value?.price || '$$', icon: 'star' }, { label: 'Opening hours', value: '10:00 AM - 10:00 PM', icon: 'clock' }, { label: 'Location', value: service.value?.location || '', icon: 'map-pin' }],
    roomTypes: [], availabilityTitle: 'Available Reservation Times', availabilityItems: ['12:00', '18:00', '19:00', '20:00'],
  }
  return {
    icon: 'flag', heading: 'About This Activity', bookingAction: 'Book Now', unit: '/ person',
    features: ['Local Guide', 'Transportation', 'Equipment', 'Entrance Fee'],
    info: [{ label: 'Duration', value: '2 hours', icon: 'clock' }, { label: 'Difficulty', value: 'Easy', icon: 'flag' }, { label: 'Available dates', value: 'Daily', icon: 'calendar' }, { label: 'Available times', value: '8:00 AM, 2:00 PM', icon: 'clock' }, { label: 'Participants', value: 'Up to 12 people', icon: 'user' }, { label: 'Location', value: service.value?.location || '', icon: 'map-pin' }],
    roomTypes: [], availabilityTitle: 'Available Dates', availabilityItems: ['10 Oct', '11 Oct', '12 Oct'], availabilityTimes: ['09:00', '13:00', '15:00'],
  }
})

watch(service, (nextService) => {
  selectedImage.value = nextService?.image || ''
  isDescriptionExpanded.value = false
  areReviewsExpanded.value = false
}, { immediate: true })

function handleAddToTrip() {
  if (!service.value || isInTrip.value) return
  if (addPlace(type.value, service.value.id, 1) === 'added') {
    showPlaceAdded(service.value.name)
  }
}
</script>

<template>
  <div v-if="service" class="service-details">
    <div class="container">
      <router-link :to="{ path: '/explore', query: { type } }" class="back-link"><Icon name="arrow-left" :size="16" /> Back to Explore</router-link>
      <header class="service-header">
        <div class="service-heading">
          <p class="eyebrow">{{ service.category }}</p>
          <h1>{{ service.name }}</h1>
          <div class="service-meta"><span><Icon name="map-pin" :size="16" /> {{ service.location || 'Location unavailable' }}</span><span v-if="rating" class="rating"><RatingDisplay :rating="rating" /> ({{ reviewCount }} reviews)</span><span v-else>No ratings yet</span></div>
          <p class="lead">{{ service.description }}</p>
        </div>
      </header>
      <section class="gallery" aria-label="Service image gallery">
        <div class="gallery-main">
          <img v-if="mainImage" :src="mainImage" :alt="service.name" />
          <div v-else class="image-placeholder"><Icon :name="typeConfig.icon" :size="36" /><span>Image unavailable</span></div>
          <span class="gallery-label"><Icon :name="typeConfig.icon" :size="15" /> {{ serviceLabel(service.type) }}</span>
          <button type="button" class="favorite-btn" :aria-pressed="isFavorite(service.id)" aria-label="Save service" @click="toggleFavorite(service.id)"><Icon :name="isFavorite(service.id) ? 'heart-filled' : 'heart'" :size="21" /></button>
        </div>
        <div class="gallery-thumbnails">
          <button v-for="image in galleryImages" :key="image.id" type="button" class="thumbnail" :class="{ active: mainImage === image.image }" :aria-label="`Show image of ${image.name}`" @click="selectedImage = image.image"><img :src="image.image" :alt="image.name" /></button>
        </div>
      </section>
      <section class="booking-bar" aria-label="Booking actions">
        <div class="booking-summary">
          <span v-if="service.type === 'restaurant'" class="booking-category">{{ service.price || 'Price unavailable' }}</span>
          <strong>{{ displayPrice }}</strong>
          <span v-if="service.price && service.type === 'activity'">{{ typeConfig.unit }}</span>
          <span v-if="service.type === 'activity'" class="booking-detail"><Icon name="clock" :size="15" /> 2 hours</span>
          <span class="availability" :class="{ limited: availability === 'Limited Availability' }"><Icon name="check" :size="15" /> {{ availability === 'Not Available' ? 'Not Available' : availability }}</span>
        </div>
        <div class="booking-actions">
          <Button v-if="canAddToTrip" variant="outline" :disabled="isInTrip" @click="handleAddToTrip"><Icon :name="isInTrip ? 'check' : 'plus'" :size="16" /> {{ isInTrip ? 'Added to Trip' : 'Add to Trip' }}</Button>
          <Button v-if="availability !== 'Not Available'" :to="`/book/${service.type}/${service.id}`" variant="accent"><Icon name="calendar" :size="16" /> {{ typeConfig.bookingAction }}</Button>
          <span v-else class="unavailable">Booking unavailable for this service.</span>
        </div>
        <p v-if="lastAddedMessage" class="trip-added-note" role="status">{{ lastAddedMessage }}</p>
      </section>
      <div class="details-layout">
        <main class="details-content">
          <section class="detail-section"><div class="section-heading"><p class="eyebrow">Service information</p><h2>{{ typeConfig.heading }}</h2></div><p :class="{ truncated: !isDescriptionExpanded }">{{ service.description }} This experience is designed for travelers who want a comfortable, well-organized way to enjoy the destination, with helpful local details available before they arrive.</p><button type="button" class="text-button" @click="isDescriptionExpanded = !isDescriptionExpanded">{{ isDescriptionExpanded ? 'Show Less' : 'Read More' }}</button></section>
          <section class="detail-section"><div class="section-heading"><p class="eyebrow">What you can expect</p><h2>{{ service.type === 'hotel' ? 'Facilities' : service.type === 'restaurant' ? 'Available services' : "What's included" }}</h2></div><div class="feature-grid"><div v-for="feature in typeConfig.features" :key="feature" class="feature-item"><span class="feature-icon"><Icon name="check" :size="16" /></span>{{ feature }}</div></div></section>
          <section v-if="typeConfig.roomTypes.length" class="detail-section"><div class="section-heading"><p class="eyebrow">Stay options</p><h2>Room types</h2></div><div class="room-list"><div v-for="room in typeConfig.roomTypes" :key="room.name" class="room-row"><span>{{ room.name }}</span><strong>{{ room.price }}</strong></div></div></section>
          <div class="info-availability-row">
            <section class="detail-section"><div class="section-heading"><p class="eyebrow">At a glance</p><h2>{{ serviceLabel(service.type) }} information</h2></div><div class="info-grid"><div v-for="item in typeConfig.info" :key="item.label" class="info-item"><Icon :name="item.icon" :size="18" /><span><small>{{ item.label }}</small><strong>{{ item.value }}</strong></span></div></div></section>
            <section class="detail-section availability-section"><div class="section-heading"><p class="eyebrow">Plan ahead</p><h2>{{ typeConfig.availabilityTitle }}</h2></div><div class="availability-list"><span v-for="item in typeConfig.availabilityItems" :key="item"><Icon name="check" :size="14" /> {{ item }}</span></div><template v-if="typeConfig.availabilityTimes"><h3>Available Times</h3><div class="availability-list"><span v-for="time in typeConfig.availabilityTimes" :key="time"><Icon name="clock" :size="14" /> {{ time }}</span></div></template></section>
          </div>
          <section class="detail-section location-section"><div class="section-heading"><p class="eyebrow">Find your way</p><h2>Location</h2></div><div class="location-panel"><Icon name="map-pin" :size="24" /><div><strong>{{ service.location || 'Location unavailable' }}</strong><p>{{ isLocating ? 'Finding exact position on the map…' : 'Real position shown below, or open the full map page.' }}</p></div><Button :to="`/map?service=${service.type}/${service.id}`" variant="outline">View on Map</Button></div></section>
          <section v-if="servicePoint" class="detail-section map-section"><PlaceMap :point="servicePoint" :title="service.name" :subtitle="service.location" /></section>
          <section class="detail-section reviews-section"><div class="section-heading"><p class="eyebrow">Traveler feedback</p><h2>Reviews</h2></div><div v-if="rating" class="review-summary"><RatingDisplay :rating="rating" /><span>Based on {{ reviewCount }} reviews</span></div><p v-else class="review-quote">No ratings yet.</p><div v-if="rating" class="review-list"><article v-for="review in (areReviewsExpanded ? sampleReviews : sampleReviews.slice(0, 2))" :key="review.name"><div class="review-author"><span class="review-avatar">{{ review.initials }}</span><span class="review-author-details"><strong>{{ review.name }}</strong><small>Verified traveler</small></span><RatingDisplay :rating="rating" /></div><p class="review-title">{{ review.title }}</p><p>{{ review.text }}</p></article></div><button v-if="rating" type="button" class="text-button reviews-toggle" @click="areReviewsExpanded = !areReviewsExpanded">{{ areReviewsExpanded ? 'Show Fewer Reviews' : 'Read More Reviews' }}</button></section>
        </main>
      </div>
      <section v-if="relatedServices.length" class="related-section"><div class="section-heading"><p class="eyebrow">Keep exploring</p><h2>Related {{ serviceLabel(service.type).toLowerCase() }}s</h2></div><div class="related-grid"><ExploreContentCard v-for="related in relatedServices" :key="related.id" :item="related" /></div></section>
    </div>
  </div>
  <div v-else class="not-found"><div class="container"><h1>Service Not Found</h1><p>The service you are looking for could not be found.</p><router-link to="/explore" class="back-link"><Icon name="arrow-left" :size="16" /> Back to Explore</router-link></div></div>
</template>

<style scoped>
.service-details { padding: 1.75rem 0 3rem; }
.back-link { display: inline-flex; align-items: center; gap: 0.35rem; margin-bottom: 1.25rem; color: var(--color-primary); font-weight: 600; }
.service-hero { position: relative; }
.service-hero img { display: block; width: 100%; height: min(42vw, 390px); min-height: 220px; object-fit: cover; border-radius: var(--radius); }
.favorite-btn { position: absolute; top: 1rem; right: 1rem; display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; background: var(--color-white); color: var(--color-primary); box-shadow: var(--shadow); cursor: pointer; }
.favorite-btn[aria-pressed='true'] { color: var(--color-accent); }
.service-header { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; margin: 1.5rem 0; }
.eyebrow { margin: 0 0 0.3rem; color: var(--color-accent); font-size: var(--fs-small); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
h1, h2 { color: var(--color-primary); }
.service-meta { display: flex; align-items: center; gap: 0.3rem; margin-top: 0.5rem; color: var(--color-muted); }
.price-block { display: grid; gap: 0.25rem; justify-items: end; }
.price-block strong { color: var(--color-accent); font-size: var(--fs-section-title); }
.price-block span { color: var(--color-primary); font-size: var(--fs-small); font-weight: 600; }
.service-grid { display: grid; grid-template-columns: minmax(0, 1fr) 20rem; gap: 1.25rem; align-items: start; }
.details-section, .booking-card { padding: 1.25rem; border-radius: var(--radius); background: var(--color-white); box-shadow: var(--shadow); }
.details-section { margin-bottom: 1rem; }
.details-section h2, .booking-card h2 { margin: 0 0 0.65rem; font-size: var(--fs-section-title); }
.details-section p, .booking-card p { color: var(--color-muted); line-height: 1.6; }
.feature-list { display: grid; gap: 0.65rem; color: var(--color-primary); }
.feature-list span { display: flex; align-items: center; gap: 0.45rem; }
.feature-list .icon { color: var(--color-accent); }
.booking-card { display: grid; gap: 0.75rem; }
.booking-card .eyebrow { margin-bottom: 0; }
.booking-card :deep(.btn) { width: 100%; }
.unavailable { padding: 0.65rem; border-radius: 8px; background: rgba(var(--color-primary-rgb), 0.06); color: var(--color-muted); font-size: var(--fs-card-desc); text-align: center; }
.not-found { padding: 4rem 0; text-align: center; }
@media (max-width: 700px) { .service-header { align-items: flex-start; flex-direction: column; } .price-block { justify-items: start; } .service-grid { grid-template-columns: 1fr; } }
</style>

<style scoped>
.gallery { display: grid; gap: .75rem; }
.gallery-main { position: relative; overflow: hidden; border-radius: var(--radius); background: var(--color-primary); }
.gallery-main img { display: block; width: 100%; height: min(42vw, 430px); min-height: 250px; object-fit: cover; transition: opacity .25s ease; }
.image-placeholder { display: grid; place-items: center; align-content: center; gap: .5rem; height: min(42vw, 430px); min-height: 250px; color: var(--color-on-dark); }
.gallery-label { position: absolute; left: 1.25rem; bottom: 1.25rem; display: inline-flex; align-items: center; gap: .4rem; padding: .5rem .75rem; border-radius: 999px; background: rgba(var(--scrim-rgb), .8); color: var(--color-on-dark); font-size: var(--fs-small); font-weight: 700; }
.gallery-thumbnails { display: grid; grid-template-columns: repeat(4, 1fr); gap: .75rem; }
.thumbnail { overflow: hidden; height: 86px; padding: 0; border: 2px solid transparent; border-radius: 8px; background: var(--color-white); cursor: pointer; }
.thumbnail.active { border-color: var(--color-accent); }
.thumbnail img { display: block; width: 100%; height: 100%; object-fit: cover; }
.service-heading { min-width: 0; }
h1 { margin: 0; font-size: clamp(1.8rem, 3.2vw, 2.8rem); }
.service-meta { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: .7rem; color: var(--color-muted); font-size: var(--fs-small); }
.service-meta span, .rating { display: inline-flex; align-items: center; gap: .35rem; }
.rating strong { color: var(--color-primary); }
.lead { max-width: 670px; margin: 1rem 0 0; color: var(--color-muted); line-height: 1.65; }
.price-block, .booking-price { display: grid; gap: .15rem; color: var(--color-muted); }
.price-block { flex: 0 0 auto; text-align: right; }
.price-block strong, .booking-price strong { color: var(--color-accent); font-size: 1.85rem; }
.price-block small, .booking-price small { color: var(--color-muted); }
.details-layout { display: block; }
.details-content { min-width: 0; padding-top: 0; }
.detail-section, .booking-panel-inner { padding: 1.5rem; border-radius: var(--radius); background: var(--color-white); box-shadow: var(--shadow); }
.detail-section { margin-bottom: 1rem; }
.info-availability-row { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); gap: 1.25rem; align-items: stretch; margin-bottom: 1rem; }
.info-availability-row .detail-section { height: 100%; }
.info-availability-row .detail-section { margin-bottom: 0; }
.section-heading { margin-bottom: 1rem; }
.detail-section p { color: var(--color-muted); line-height: 1.65; }
.truncated { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.text-button { padding: 0; border: 0; background: none; color: var(--color-primary); font: inherit; font-weight: 700; cursor: pointer; }
.feature-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem 1rem; }
.feature-item, .info-item { display: flex; align-items: center; gap: .55rem; color: var(--color-primary); }
.feature-icon { display: grid; place-items: center; width: 27px; height: 27px; border-radius: 50%; background: rgba(var(--color-accent-rgb), .18); color: var(--color-accent); }
.room-list { display: grid; gap: .5rem; }
.room-row { display: flex; justify-content: space-between; gap: 1rem; padding: .8rem 0; border-bottom: 1px solid rgba(var(--color-primary-rgb), .12); color: var(--color-primary); }
.room-row strong { color: var(--color-accent); }
.info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.1rem; }
.info-item { align-items: flex-start; }
.info-item > svg { flex: 0 0 auto; color: var(--color-accent); }
.info-item span { display: grid; gap: .2rem; }
.info-item small { color: var(--color-muted); }
.info-item strong { font-size: var(--fs-card-desc); }
.availability-list { display: flex; flex-wrap: wrap; gap: .6rem; }
.availability-list span { display: inline-flex; align-items: center; gap: .35rem; padding: .5rem .7rem; border: 1px solid rgba(var(--color-primary-rgb), .15); border-radius: 8px; color: var(--color-primary); font-size: var(--fs-small); font-weight: 600; }
.availability-list svg { color: var(--color-accent); }
.availability-section h3 { margin: 1.1rem 0 .65rem; color: var(--color-primary); font-size: var(--fs-card-title); }
.location-panel { display: flex; align-items: center; gap: .9rem; padding: 1rem; border-radius: 8px; background: rgba(var(--color-primary-rgb), .07); color: var(--color-primary); }
.location-panel > svg { flex: 0 0 auto; color: var(--color-accent); }
.location-panel div { flex: 1; }
.location-panel p { margin: .25rem 0 0; font-size: var(--fs-card-desc); }
.location-panel :deep(.btn) { flex: 0 0 auto; padding: .5rem .8rem; }
.review-summary { display: flex; align-items: center; gap: .5rem; color: var(--color-muted); }
.review-summary > strong { color: var(--color-primary); font-size: 1.5rem; }
.review-summary span { font-size: var(--fs-small); }
.review-quote { margin-bottom: 0; }
.review-list { display: grid; gap: .9rem; margin-top: 1rem; }
.review-list article { padding-top: .9rem; border-top: 1px solid rgba(var(--color-primary-rgb), .12); }
.review-author { display: flex; align-items: center; gap: .6rem; color: var(--color-primary); }
.review-avatar { display: grid; flex: 0 0 auto; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: var(--color-primary); color: var(--color-white); font-size: var(--fs-small); font-weight: 700; }
.review-author-details { display: grid; flex: 1; gap: .1rem; }
.review-author-details small { color: var(--color-muted); font-size: 11px; }
.review-author :deep(.rating) { flex: 0 0 auto; }
.review-title { margin: .55rem 0 0; color: var(--color-primary) !important; font-weight: 700; }
.review-list article > p:not(.review-title) { margin: .25rem 0 0; font-size: var(--fs-card-desc); }
.reviews-toggle { margin-top: 1rem; }
.booking-bar { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; margin: 1.25rem 0; padding: 1rem 1.25rem; border-radius: var(--radius); background: var(--color-white); box-shadow: var(--shadow); }
.trip-added-note { margin: -0.5rem 0 1rem; padding: 0.55rem 0.9rem; border-radius: 8px; background: rgba(var(--color-accent-rgb), 0.12); color: var(--color-primary); font-size: var(--fs-card-desc); font-weight: 600; width: fit-content; }
.booking-summary, .booking-actions { display: flex; align-items: center; flex-wrap: wrap; gap: .55rem; }
.booking-summary { color: var(--color-muted); }
.booking-summary strong { color: var(--color-accent); font-size: 1.35rem; }
.booking-summary > span:not(.availability):not(.booking-detail) { color: var(--color-primary); }
.booking-category { font-weight: 700; }
.booking-detail { display: inline-flex; align-items: center; gap: .3rem; color: var(--color-muted); }
.booking-summary .availability { display: inline-flex; align-items: center; gap: .3rem; margin-left: .6rem; color: var(--color-primary); font-size: var(--fs-small); font-weight: 700; }
.booking-summary .availability.limited { color: var(--color-accent); }
.booking-actions :deep(.btn) { white-space: nowrap; }
.booking-panel-inner { display: grid; gap: .85rem; }
.booking-panel h2 { font-size: 1.55rem; }
.availability { margin: 0; }
.availability span { display: inline-flex; align-items: center; gap: .35rem; color: var(--color-primary); font-size: var(--fs-small); font-weight: 700; }
.availability span.limited { color: var(--color-accent); }
.booking-panel :deep(.btn) { width: 100%; }
.booking-note { margin: 0; color: var(--color-muted); font-size: var(--fs-small); line-height: 1.5; }
.related-section { padding-top: 2rem; }
.related-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
@media (max-width: 800px) { .service-header { align-items: flex-start; flex-direction: column; } .price-block { text-align: left; } }
@media (max-width: 760px) { .info-availability-row { grid-template-columns: 1fr; gap: 0; } }
@media (max-width: 560px) { .gallery-thumbnails { gap: .45rem; } .thumbnail { height: 62px; } .feature-grid, .info-grid, .related-grid { grid-template-columns: 1fr; } .detail-section, .booking-panel-inner { padding: 1.15rem; } .location-panel { align-items: flex-start; flex-wrap: wrap; } .location-panel :deep(.btn) { margin-left: 2.1rem; } .booking-bar { align-items: stretch; flex-direction: column; gap: 1rem; } .booking-actions :deep(.btn), .booking-actions .unavailable { flex: 1 1 100%; } }
</style>
