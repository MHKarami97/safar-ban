import { createRouter, createWebHistory } from 'vue-router'

var HomeView = () => import('../views/HomeView.vue')
var RegionsHomeView = () => import('../views/RegionsHomeView.vue')
var RegionManageView = () => import('../views/RegionManageView.vue')
var RegionDetailView = () => import('../views/RegionDetailView.vue')
var TripListView = () => import('../views/TripListView.vue')
var TripGuideView = () => import('../views/TripGuideView.vue')
var TripCreateView = () => import('../views/TripCreateView.vue')
var TripDestinationsView = () => import('../views/TripDestinationsView.vue')
var TripDetailView = () => import('../views/TripDetailView.vue')

var routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/regions', name: 'regions-home', component: RegionsHomeView },
  { path: '/regions/manage', name: 'region-manage', component: RegionManageView },
  { path: '/regions/:id', name: 'region-detail', component: RegionDetailView, props: true },
  { path: '/trips', name: 'trip-list', component: TripListView },
  { path: '/trips/guide', name: 'trip-guide', component: TripGuideView },
  { path: '/trips/create', name: 'trip-create', component: TripCreateView },
  { path: '/trips/:id/destinations', name: 'trip-destinations', component: TripDestinationsView, props: true },
  { path: '/trips/:id', name: 'trip-detail', component: TripDetailView, props: true }
]

var router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
