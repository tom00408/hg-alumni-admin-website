<template>
	<div class="mitglieder-page">
		<!-- Header -->
		<div class="page-header">
			<div class="header-content">
				<h1 class="page-title">Mitgliedsanträge</h1>
				<p class="page-subtitle">
					Verwalten Sie alle eingegangenen Mitgliedsanträge
				</p>
			</div>
			<div class="header-actions">
				<TomButton
					@click="refreshApplications"
					title="Aktualisieren"
					icon="refresh"
					variant="secondary"
					:disabled="loading" />
			</div>
		</div>

		<!-- Loading State -->
		<div
			v-if="loading && applications.length === 0"
			class="loading-container">
			<div class="loading-spinner"></div>
			<p>Mitgliedsanträge werden geladen...</p>
		</div>

		<!-- Error State -->
		<div v-else-if="error" class="error-container">
			<div class="error-content">
				<svg
					class="error-icon"
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="currentColor">
					<path
						d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
				</svg>
				<h3>Fehler beim Laden der Daten</h3>
				<p>{{ error }}</p>
				<TomButton
					@click="refreshApplications"
					title="Erneut versuchen"
					icon="refresh"
					variant="primary" />
			</div>
		</div>

		<!-- Content -->
		<div v-else class="page-content">
			<!-- Filter Tabs -->
			<div class="filter-tabs">
				<button
					v-for="filter in filters"
					:key="filter.key"
					@click="activeFilter = filter.key"
					class="filter-tab"
					:class="{
						'filter-tab--active': activeFilter === filter.key,
					}">
					{{ filter.label }}
					<span class="filter-count"
						>({{
							getFilteredApplications(filter.key).length
						}})</span
					>
				</button>
			</div>

			<!-- Applications List -->
			<div class="applications-container">
				<div
					v-if="getFilteredApplications(activeFilter).length === 0"
					class="empty-state">
					<div class="empty-icon">
						<svg
							width="64"
							height="64"
							viewBox="0 0 24 24"
							fill="currentColor">
							<path
								d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
						</svg>
					</div>
					<h3>Keine Anträge gefunden</h3>
					<p v-if="activeFilter === 'all'">
						Es sind noch keine Mitgliedsanträge eingegangen.
					</p>
					<p v-else>
						Keine Anträge mit dem Status "{{
							getFilterLabel(activeFilter)
						}}" gefunden.
					</p>
				</div>

				<div v-else class="applications-list">
					<div
						v-for="application in getFilteredApplications(
							activeFilter
						)"
						:key="application.id"
						class="application-card"
						:class="`application-card--${application.status}`"
						@click="openApplicationModal(application)">
						<div class="application-header">
							<div class="application-info">
								<h3 class="application-name">
									{{ application.firstName }} {{ application.lastName }}
								</h3>
								<p class="application-email">
									{{ application.email }}
								</p>
								<div class="application-meta">
									<span class="application-date">
										{{ formatDate(application.createdAt) }}
									</span>
									<span
										class="application-status"
										:class="`status--${application.status}`">
										{{ getStatusLabel(application.status) }}
									</span>
								</div>
							</div>
							<div class="application-actions">
								<svg class="click-hint" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
								</svg>
								<span class="click-hint-text">Klicken für Details</span>
							</div>
						</div>

						<div class="application-details">
							<div
								v-if="application.city"
								class="detail-item">
								<span class="detail-label">Stadt:</span>
								<span class="detail-value">{{ application.city }}</span>
							</div>
							<div
								v-if="application.birthDate"
								class="detail-item">
								<span class="detail-label">Geburtsdatum:</span>
								<span class="detail-value">{{ formatDateGerman(application.birthDate) }}</span>
							</div>
							<div
								v-if="application.schoolFrom"
								class="detail-item">
								<span class="detail-label">Schulzeit:</span>
								<span class="detail-value">{{ formatDateGerman(application.schoolFrom) }} - {{ application.schoolTo ? formatDateGerman(application.schoolTo) : 'Laufend' }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Application Detail Modal -->
	<ApplicationDetailModal
		v-if="selectedApplication"
		:is-open="isModalOpen"
		:application="selectedApplication"
		:is-processing="isProcessing"
		@close="closeApplicationModal"
		@approve="handleApprove"
		@reject="handleReject"
		@in-progress="handleInProgress"
		@update="handleUpdate"
		@delete="handleDelete"
	/>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMembershipStore } from '../stores/membership';
import TomButton from '../tomponents/TomButton.vue';
import ApplicationDetailModal from '../components/mitglieder/ApplicationDetailModal.vue';
import type { MembershipApplication } from '../lib/types';

const membershipStore = useMembershipStore();

// Reactive data
const activeFilter = ref<string>('all');
const isModalOpen = ref(false);
const selectedApplication = ref<MembershipApplication | null>(null);
const isProcessing = ref(false);

// Computed properties
const applications = computed(() => membershipStore.applications);
const loading = computed(() => membershipStore.loading);
const error = computed(() => membershipStore.error);

const newApplications = computed(() => membershipStore.newApplications);
const inProgressApplications = computed(() => membershipStore.inProgressApplications);
const approvedApplications = computed(
	() => membershipStore.approvedApplications
);
const rejectedApplications = computed(
	() => membershipStore.rejectedApplications
);

// Filter options
const filters = [
	{ key: 'all', label: 'Alle' },
	{ key: 'new', label: 'Neu' },
	{ key: 'in_progress', label: 'In Bearbeitung' },
	{ key: 'approved', label: 'Genehmigt' },
	{ key: 'rejected', label: 'Abgelehnt' },
];

// Methods
const getFilteredApplications = (filter: string): MembershipApplication[] => {
	switch (filter) {
		case 'new':
			return applications.value.filter(app => app.status === 'new');
		case 'in_progress':
			return applications.value.filter(app => app.status === 'in_progress');
		case 'approved':
			return approvedApplications.value;
		case 'rejected':
			return rejectedApplications.value;
		default:
			return applications.value;
	}
};

const getFilterLabel = (filter: string): string => {
	const filterObj = filters.find((f) => f.key === filter);
	return filterObj ? filterObj.label : 'Alle';
};

const getStatusLabel = (status?: string): string => {
	switch (status) {
		case 'new':
			return 'Neu';
		case 'in_progress':
			return 'In Bearbeitung';
		case 'approved':
			return 'Genehmigt';
		case 'rejected':
			return 'Abgelehnt';
		default:
			return 'Unbekannt';
	}
};

const formatDate = (timestamp: any): string => {
	if (!timestamp) return 'Unbekannt';

	if (timestamp.toDate && typeof timestamp.toDate === 'function') {
		return timestamp.toDate().toLocaleDateString('de-DE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	if (timestamp instanceof Date) {
		return timestamp.toLocaleDateString('de-DE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}

	return 'Unbekannt';
};

const formatDateGerman = (dateString: string): string => {
	if (!dateString) return 'Nicht angegeben';
	
	try {
		// Versuche verschiedene Datumsformate zu parsen
		let date: Date;
		
		// Prüfe ob es bereits im deutschen Format ist (dd.mm.yyyy)
		if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
			return dateString;
		}
		
		// Prüfe ISO Format (yyyy-mm-dd)
		if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
			date = new Date(dateString);
		} else {
			// Versuche das Datum zu parsen
			date = new Date(dateString);
		}
		
		// Prüfe ob das Datum gültig ist
		if (isNaN(date.getTime())) {
			return dateString; // Fallback: Original-String zurückgeben
		}
		
		// Formatiere im deutschen Format (dd.mm.yyyy)
		return date.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	} catch (error) {
		return dateString; // Fallback: Original-String zurückgeben
	}
};

const refreshApplications = async () => {
	try {
		await membershipStore.fetchApplications();
	} catch (err) {
		console.error('Error refreshing applications:', err);
	}
};

const updateStatus = async (
	id: string,
	status: 'new' | 'in_progress' | 'approved' | 'rejected'
) => {
	try {
		await membershipStore.updateApplicationStatus(id, status);
	} catch (err) {
		console.error('Error updating application status:', err);
	}
};

const deleteApplication = async (id: string) => {
	if (confirm('Sind Sie sicher, dass Sie diesen Antrag löschen möchten?')) {
		try {
			await membershipStore.deleteApplication(id);
		} catch (err) {
			console.error('Error deleting application:', err);
		}
	}
};

// Modal methods
const openApplicationModal = (application: MembershipApplication) => {
	selectedApplication.value = application;
	isModalOpen.value = true;
};

const closeApplicationModal = () => {
	isModalOpen.value = false;
	selectedApplication.value = null;
};

const handleApprove = async (id: string) => {
	isProcessing.value = true;
	try {
		await updateStatus(id, 'approved');
		closeApplicationModal();
	} catch (err) {
		console.error('Error approving application:', err);
	} finally {
		isProcessing.value = false;
	}
};

const handleReject = async (id: string) => {
	isProcessing.value = true;
	try {
		await updateStatus(id, 'rejected');
		closeApplicationModal();
	} catch (err) {
		console.error('Error rejecting application:', err);
	} finally {
		isProcessing.value = false;
	}
};

const handleInProgress = async (id: string) => {
	isProcessing.value = true;
	try {
		await updateStatus(id, 'in_progress');
		closeApplicationModal();
	} catch (err) {
		console.error('Error setting application to in progress:', err);
	} finally {
		isProcessing.value = false;
	}
};

const handleDelete = async (id: string) => {
	isProcessing.value = true;
	try {
		await deleteApplication(id);
		closeApplicationModal();
	} catch (err) {
		console.error('Error deleting application:', err);
	} finally {
		isProcessing.value = false;
	}
};

const handleUpdate = async (id: string, data: Partial<MembershipApplication>) => {
	isProcessing.value = true;
	try {
		await membershipStore.updateApplication(id, data);
		closeApplicationModal();
	} catch (err) {
		console.error('Error updating application:', err);
	} finally {
		isProcessing.value = false;
	}
};

// Lifecycle
onMounted(async () => {
	if (applications.value.length === 0) {
		await refreshApplications();
	}
});
</script>

<style scoped>
.mitglieder-page {
	padding: var(--spacing-xl);
	max-width: 1200px;
	margin: 0 auto;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: var(--spacing-xl);
	gap: var(--spacing-lg);
}

.header-content {
	flex: 1;
}

.page-title {
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-bold);
	color: var(--color-text);
	margin: 0 0 var(--spacing-sm) 0;
}

.page-subtitle {
	font-size: var(--font-size-lg);
	color: var(--color-text-secondary);
	margin: 0;
}

.header-actions {
	display: flex;
	gap: var(--spacing-md);
}

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: var(--spacing-xxl);
	text-align: center;
}

.loading-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid var(--color-gray-200);
	border-top: 4px solid var(--color-primary);
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: var(--spacing-lg);
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.error-container {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: var(--spacing-xxl);
}

.error-content {
	text-align: center;
	max-width: 400px;
}

.error-icon {
	color: var(--color-danger);
	margin-bottom: var(--spacing-lg);
}

.error-content h3 {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text);
	margin: 0 0 var(--spacing-sm) 0;
}

.error-content p {
	color: var(--color-text-secondary);
	margin: 0 0 var(--spacing-lg) 0;
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: var(--spacing-lg);
	margin-bottom: var(--spacing-xl);
}

.stat-card {
	background: var(--color-white);
	border-radius: var(--radius-lg);
	padding: var(--spacing-lg);
	box-shadow: var(--shadow-sm);
	border: 1px solid var(--color-gray-200);
	display: flex;
	align-items: center;
	gap: var(--spacing-md);
	transition: all var(--transition-fast);
}

.stat-card:hover {
	box-shadow: var(--shadow-md);
	transform: translateY(-2px);
}

.stat-card--pending {
	border-left: 4px solid var(--color-warning);
}

.stat-card--approved {
	border-left: 4px solid var(--color-success);
}

.stat-card--rejected {
	border-left: 4px solid var(--color-danger);
}

.stat-card--total {
	border-left: 4px solid var(--color-primary);
}

.stat-icon {
	width: 48px;
	height: 48px;
	border-radius: var(--radius-lg);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.stat-card--pending .stat-icon {
	background: rgba(245, 158, 11, 0.1);
	color: var(--color-warning);
}

.stat-card--approved .stat-icon {
	background: rgba(34, 197, 94, 0.1);
	color: var(--color-success);
}

.stat-card--rejected .stat-icon {
	background: rgba(239, 68, 68, 0.1);
	color: var(--color-danger);
}

.stat-card--total .stat-icon {
	background: rgba(59, 130, 246, 0.1);
	color: var(--color-primary);
}

.stat-content {
	flex: 1;
}

.stat-number {
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-bold);
	color: var(--color-text);
	margin: 0 0 var(--spacing-xs) 0;
	line-height: 1;
}

.stat-label {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	margin: 0;
	font-weight: var(--font-weight-medium);
}

.filter-tabs {
	display: flex;
	gap: var(--spacing-sm);
	margin-bottom: var(--spacing-xl);
	border-bottom: 1px solid var(--color-gray-200);
	overflow-x: auto;
}

.filter-tab {
	background: none;
	border: none;
	padding: var(--spacing-md) var(--spacing-lg);
	font-size: var(--font-size-base);
	font-weight: var(--font-weight-medium);
	color: var(--color-text-secondary);
	cursor: pointer;
	border-bottom: 2px solid transparent;
	transition: all var(--transition-fast);
	white-space: nowrap;
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.filter-tab:hover {
	color: var(--color-text);
	background: var(--color-gray-50);
}

.filter-tab--active {
	color: var(--color-primary);
	border-bottom-color: var(--color-primary);
	background: rgba(59, 130, 246, 0.05);
}

.filter-count {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	background: var(--color-gray-100);
	padding: 2px 6px;
	border-radius: var(--radius-sm);
}

.filter-tab--active .filter-count {
	background: var(--color-primary);
	color: var(--color-white);
}

.applications-container {
	background: var(--color-white);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-sm);
	border: 1px solid var(--color-gray-200);
	overflow: hidden;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: var(--spacing-xxl);
	text-align: center;
}

.empty-icon {
	color: var(--color-gray-400);
	margin-bottom: var(--spacing-lg);
}

.empty-state h3 {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text);
	margin: 0 0 var(--spacing-sm) 0;
}

.empty-state p {
	color: var(--color-text-secondary);
	margin: 0;
}

.applications-list {
	display: flex;
	flex-direction: column;
}

.application-card {
	border-bottom: 1px solid var(--color-gray-200);
	padding: var(--spacing-lg);
	transition: all var(--transition-fast);
}

.application-card:last-child {
	border-bottom: none;
}

.application-card:hover {
	background: var(--color-gray-50);
	cursor: pointer;
	transform: translateY(-2px);
	box-shadow: var(--shadow-md);
}

.application-card--new {
	border-left: 4px solid var(--color-primary);
}

.application-card--in_progress {
	border-left: 4px solid var(--color-warning);
}

.application-card--approved {
	border-left: 4px solid var(--color-success);
}

.application-card--rejected {
	border-left: 4px solid var(--color-danger);
}

.application-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: var(--spacing-md);
	gap: var(--spacing-lg);
}

.application-info {
	flex: 1;
	min-width: 0;
}

.application-name {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--color-text);
	margin: 0 0 var(--spacing-xs) 0;
}

.application-email {
	font-size: var(--font-size-base);
	color: var(--color-text-secondary);
	margin: 0 0 var(--spacing-sm) 0;
}

.application-meta {
	display: flex;
	align-items: center;
	gap: var(--spacing-md);
	flex-wrap: wrap;
}

.application-date {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
}

.application-status {
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	padding: 4px 8px;
	border-radius: var(--radius-sm);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.status--new {
	background: rgba(59, 130, 246, 0.1);
	color: var(--color-primary);
}

.status--in_progress {
	background: rgba(245, 158, 11, 0.1);
	color: var(--color-warning);
}

.status--approved {
	background: rgba(34, 197, 94, 0.1);
	color: var(--color-success);
}

.status--rejected {
	background: rgba(239, 68, 68, 0.1);
	color: var(--color-danger);
}

.application-actions {
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
	flex-shrink: 0;
}

.click-hint {
	color: var(--color-gray-400);
	transition: all var(--transition-fast);
}

.click-hint-text {
	font-size: var(--font-size-sm);
	color: var(--color-gray-500);
	font-weight: var(--font-weight-medium);
}

.application-card:hover .click-hint {
	color: var(--color-primary);
	transform: translateX(4px);
}

.application-card:hover .click-hint-text {
	color: var(--color-primary);
}

.application-details {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: var(--spacing-md);
}

.detail-item {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
}

.detail-label {
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	color: var(--color-text-secondary);
}

.detail-value {
	font-size: var(--font-size-sm);
	color: var(--color-text);
}

/* Responsive Design */
@media (max-width: 768px) {
  .mitglieder-page {
    padding: var(--spacing-md);
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }
  
  .page-title {
    font-size: var(--font-size-xl);
  }
  
  .page-subtitle {
    font-size: var(--font-size-base);
  }
  
  .header-actions {
    justify-content: flex-end;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }
  
  .stat-card {
    padding: var(--spacing-md);
  }
  
  .stat-number {
    font-size: var(--font-size-xl);
  }
  
  .stat-label {
    font-size: var(--font-size-xs);
  }
  
  .filter-tabs {
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-lg);
    overflow-x: auto;
    padding-bottom: var(--spacing-xs);
  }
  
  .filter-tab {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
    white-space: nowrap;
  }
  
  .application-card {
    padding: var(--spacing-md);
  }
  
  .application-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .application-name {
    font-size: var(--font-size-base);
  }
  
  .application-email {
    font-size: var(--font-size-sm);
  }
  
  .application-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .application-actions {
    justify-content: flex-end;
    margin-top: var(--spacing-sm);
  }
  
  .click-hint-text {
    font-size: var(--font-size-xs);
  }
  
  .application-details {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
  }
  
  .detail-item {
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  .detail-label {
    font-size: var(--font-size-xs);
    min-width: 80px;
  }
  
  .detail-value {
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 480px) {
  .mitglieder-page {
    padding: var(--spacing-sm);
  }
  
  .page-title {
    font-size: var(--font-size-lg);
  }
  
  .page-subtitle {
    font-size: var(--font-size-sm);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }
  
  .stat-card {
    padding: var(--spacing-sm);
  }
  
  .stat-number {
    font-size: var(--font-size-lg);
  }
  
  .stat-label {
    font-size: 10px;
  }
  
  .filter-tabs {
    margin-bottom: var(--spacing-md);
  }
  
  .filter-tab {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
  
  .application-card {
    padding: var(--spacing-sm);
  }
  
  .application-name {
    font-size: var(--font-size-sm);
  }
  
  .application-email {
    font-size: var(--font-size-xs);
  }
  
  .application-actions {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
  
  .click-hint {
    width: 16px;
    height: 16px;
  }
  
  .click-hint-text {
    font-size: 10px;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  
  .detail-label {
    font-size: 10px;
    min-width: auto;
  }
  
  .detail-value {
    font-size: var(--font-size-xs);
  }
}
</style>
