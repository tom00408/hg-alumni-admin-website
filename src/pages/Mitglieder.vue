<template>
	<div class="mitglieder-page">
		<!-- Header -->
		<div class="page-header">
			<div class="header-content">
				<h1 class="page-title">Mitglieder</h1>
				<p class="page-subtitle">
					Übersicht aller Vereinsmitglieder
				</p>
			</div>
			<div class="header-actions">
				<TomButton
					@click="refreshMembers"
					title="Aktualisieren"
					icon="refresh"
					variant="secondary"
					:loading="loading"
				/>
			</div>
    </div>
            
            
            
            <!-- Actions Bar -->
            <div v-if="selectedMembers.length > 0" class="actions-bar">
                <div class="selected-info">
                    <span class="selected-count">{{ selectedMembers.length }} Mitglied(er) ausgewählt</span>
                </div>
                <div class="action-buttons">
				<TomButton
					@click="editSelectedMembers"
					title="Ausgewählte bearbeiten"
					icon="edit"
					variant="primary"
					:disabled="selectedMembers.length === 0"
				>
					Bearbeiten
				</TomButton>
				<TomButton
					@click="exportSelectedMembers"
					title="Ausgewählte exportieren"
					icon="download"
					variant="secondary"
					:disabled="selectedMembers.length === 0"
				>
					Exportieren
				</TomButton>
				<TomButton
					@click="deleteSelectedMembers"
					title="Ausgewählte löschen"
					icon="delete"
					variant="danger"
					:disabled="selectedMembers.length === 0"
				>
					Löschen
				</TomButton>
				<TomButton
					@click="clearSelection"
					title="Auswahl aufheben"
					icon="close"
					variant="secondary"
				>
					Auswahl aufheben
				</TomButton>
			</div>
		</div>

		<!-- Members Table -->
		<div class="table-container">
			<div v-if="loading" class="loading-state">
				<div class="loading-spinner"></div>
				<p>Mitglieder werden geladen...</p>
			</div>

			<div v-else-if="error" class="error-state">
				<div class="error-icon">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
					</svg>
				</div>
				<h3>Fehler beim Laden</h3>
				<p>{{ error }}</p>
				<TomButton @click="refreshMembers" variant="primary">
					Erneut versuchen
				</TomButton>
			</div>

			<div v-else class="table-wrapper">
				<table class="members-table">
					<thead>
						<tr>
							<th class="checkbox-header">
								<input
									type="checkbox"
									:checked="isAllSelected"
									@change="toggleSelectAll"
									class="select-all-checkbox"
								/>
							</th>
							<th class="sortable" @click="sortBy('lastName')">
								Name
								<span class="sort-indicator" :class="{ active: sortField === 'lastName' }">
									{{ sortField === 'lastName' && sortDirection === 'asc' ? '↑' : '↓' }}
								</span>
							</th>
							<th class="sortable" @click="sortBy('email')">
								E-Mail
								<span class="sort-indicator" :class="{ active: sortField === 'email' }">
									{{ sortField === 'email' && sortDirection === 'asc' ? '↑' : '↓' }}
								</span>
							</th>
							<th>Mitgliedsnummer</th>
							<th class="sortable" @click="sortBy('memberSince')">
								Mitglied seit
								<span class="sort-indicator" :class="{ active: sortField === 'memberSince' }">
									{{ sortField === 'memberSince' && sortDirection === 'asc' ? '↑' : '↓' }}
								</span>
							</th>
							<th class="filterable" @click="toggleStatusFilter">
								Status
								<span class="filter-indicator" :class="{ active: selectedFilter !== 'all' }">
									{{ selectedFilter !== 'all' ? '🔽' : '🔽' }}
								</span>
								<span v-if="selectedFilter !== 'all'" class="active-filter-badge">
									{{ statusFilters.find(f => f.key === selectedFilter)?.label }}
								</span>
								<div v-if="showStatusFilter" class="filter-dropdown" @click.stop>
									<button
										v-for="filter in statusFilters"
										:key="filter.key"
										@click="selectStatusFilter(filter.key)"
										:class="['filter-option', { active: selectedFilter === filter.key }]"
									>
										{{ filter.label }}
										<span class="filter-count">({{ getFilteredMembers(filter.key).length }})</span>
									</button>
								</div>
							</th>
							<th>Anrede</th>
							<th>Geburtsdatum</th>
							<th>Adresse</th>
							<th>Stadt</th>
							<th>PLZ</th>
							<th>Beruf</th>
							<th>IBAN</th>
							<th>BIC</th>
							<th>Schulzeit von</th>
							<th>Schulzeit bis</th>
							<th>Aktionen</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="member in sortedMembers" :key="member.id" class="member-row">
							<td class="member-checkbox">
								<input
									type="checkbox"
									:checked="isMemberSelected(member.id!)"
									@change="toggleMemberSelection(member.id!)"
									class="member-checkbox-input"
								/>
							</td>
							<td class="member-name" data-label="">
								<div class="name-cell">
									<div class="full-name">{{ member.firstName }} {{ member.lastName }}</div>
									<div class="salutation">{{ member.salutation }}</div>
								</div>
							</td>
							<td class="member-email" data-label="E-Mail">
								<a :href="`mailto:${member.email}`" class="email-link">
									{{ member.email }}
								</a>
							</td>
							<td class="member-number" data-label="Mitgliedsnummer">{{ member.membershipNumber }}</td>
							<td class="member-since" data-label="Mitglied seit">{{ formatDate(member.memberSince) }}</td>
							<td class="member-status" data-label="Status">
								<span class="status-badge" :class="`status--${member.status}`">
									{{ getStatusLabel(member.status) }}
								</span>
							</td>
							<td class="member-salutation" data-label="Anrede">{{ member.salutation }}</td>
							<td class="member-birthdate" data-label="Geburtsdatum">{{ formatDateGerman(member.birthDate) }}</td>
							<td class="member-address" data-label="Adresse">{{ member.address }}</td>
							<td class="member-city" data-label="Stadt">{{ member.city }}</td>
							<td class="member-postal" data-label="PLZ">{{ member.postalCode }}</td>
							<td class="member-occupation" data-label="Beruf">{{ member.occupation || '-' }}</td>
							<td class="member-iban" data-label="IBAN">{{ member.iban }}</td>
							<td class="member-bic" data-label="BIC">{{ member.bic }}</td>
							<td class="member-school-from" data-label="Schulzeit von">{{ formatDateGerman(member.schoolFrom || '') }}</td>
							<td class="member-school-to" data-label="Schulzeit bis">{{ formatDateGerman(member.schoolTo || '') }}</td>
							<td class="member-actions" data-label="">
								<div class="action-buttons">
									<TomButton
										@click="viewMember(member)"
										title="Anzeigen"
										icon="eye"
										variant="secondary"
										size="small"
									/>
									<TomButton
										@click="editMember(member)"
										title="Bearbeiten"
										icon="edit"
										variant="primary"
										size="small"
									/>
									<TomButton
										@click="deleteMember(member)"
										title="Löschen"
										icon="delete"
										variant="danger"
										size="small"
									/>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMembersStore } from '../stores/members';
import type { Member } from '../lib/types';
import TomButton from '../tomponents/TomButton.vue';

// Store
const membersStore = useMembersStore();

// State
const selectedFilter = ref('all');
const sortField = ref<string>('lastName');
const sortDirection = ref<'asc' | 'desc'>('asc');
const showStatusFilter = ref(false);
const selectedMembers = ref<string[]>([]);

// Computed properties
const members = computed(() => membersStore.members);
const loading = computed(() => membersStore.loading);
const error = computed(() => membersStore.error);

const activeMembers = computed(() => membersStore.activeMembers);
const inactiveMembers = computed(() => membersStore.inactiveMembers);
const suspendedMembers = computed(() => membersStore.suspendedMembers);
const totalMembers = computed(() => membersStore.totalMembers);

const isAllSelected = computed(() => {
	return filteredMembers.value.length > 0 && selectedMembers.value.length === filteredMembers.value.length;
});

const selectedMembersData = computed(() => {
	return members.value.filter(member => selectedMembers.value.includes(member.id!));
});

// Filter options
const statusFilters = [
	{ key: 'all', label: 'Alle' },
	{ key: 'active', label: 'Aktiv' },
	{ key: 'inactive', label: 'Inaktiv' },
	{ key: 'suspended', label: 'Gesperrt' }
];

// Methods
const getFilteredMembers = (filter: string): Member[] => {
	switch (filter) {
		case 'active':
			return activeMembers.value;
		case 'inactive':
			return inactiveMembers.value;
		case 'suspended':
			return suspendedMembers.value;
		default:
			return members.value;
	}
};

const filteredMembers = computed(() => {
	return getFilteredMembers(selectedFilter.value);
});

const sortedMembers = computed(() => {
	const sorted = [...filteredMembers.value];
	
	return sorted.sort((a, b) => {
		let aValue: any = a[sortField.value as keyof Member];
		let bValue: any = b[sortField.value as keyof Member];
		
		// Handle Timestamp objects
		if (aValue && typeof aValue === 'object' && 'toMillis' in aValue) {
			aValue = aValue.toMillis();
		}
		if (bValue && typeof bValue === 'object' && 'toMillis' in bValue) {
			bValue = bValue.toMillis();
		}
		
		if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1;
		if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1;
		return 0;
	});
});

const sortBy = (field: string) => {
	if (sortField.value === field) {
		sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
	} else {
		sortField.value = field;
		sortDirection.value = 'asc';
	}
};

const toggleStatusFilter = () => {
	showStatusFilter.value = !showStatusFilter.value;
};

const selectStatusFilter = (filterKey: string) => {
	selectedFilter.value = filterKey;
	showStatusFilter.value = false;
};

const toggleSelectAll = () => {
	if (isAllSelected.value) {
		selectedMembers.value = [];
	} else {
		selectedMembers.value = filteredMembers.value.map(member => member.id!);
	}
};

const toggleMemberSelection = (memberId: string) => {
	const index = selectedMembers.value.indexOf(memberId);
	if (index > -1) {
		selectedMembers.value.splice(index, 1);
	} else {
		selectedMembers.value.push(memberId);
	}
};

const isMemberSelected = (memberId: string) => {
	return selectedMembers.value.includes(memberId);
};

const clearSelection = () => {
	selectedMembers.value = [];
};

const getStatusLabel = (status?: string): string => {
	switch (status) {
		case 'active':
			return 'Aktiv';
		case 'inactive':
			return 'Inaktiv';
		case 'suspended':
			return 'Gesperrt';
		default:
			return 'Unbekannt';
	}
};

const formatDate = (timestamp: any): string => {
	if (!timestamp) return 'Unbekannt';

	if (timestamp.toDate && typeof timestamp.toDate === 'function') {
		return timestamp.toDate().toLocaleDateString('de-DE');
	}

	if (timestamp instanceof Date) {
		return timestamp.toLocaleDateString('de-DE');
	}

	return 'Unbekannt';
};

const formatDateGerman = (dateString: string): string => {
	if (!dateString) return 'Nicht angegeben';

	try {
		let date: Date;
		if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
			return dateString;
		}
		if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
			date = new Date(dateString);
		} else {
			date = new Date(dateString);
		}
		if (isNaN(date.getTime())) {
			return dateString;
		}
		return date.toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	} catch (error) {
		return dateString;
	}
};

const refreshMembers = async () => {
	try {
		await membersStore.fetchMembers();
	} catch (err) {
		console.error('Error refreshing members:', err);
	}
};

const viewMember = (member: Member) => {
	// TODO: Implement member detail view
	console.log('View member:', member);
};

const editMember = (member: Member) => {
	// TODO: Implement member edit
	console.log('Edit member:', member);
};

const deleteMember = async (member: Member) => {
	if (confirm(`Sind Sie sicher, dass Sie ${member.firstName} ${member.lastName} als Mitglied entfernen möchten?`)) {
		try {
			await membersStore.deleteMember(member.id!);
		} catch (err) {
			console.error('Error deleting member:', err);
		}
	}
};

const editSelectedMembers = () => {
	// TODO: Implement bulk edit modal
	console.log('Edit selected members:', selectedMembersData.value);
	alert(`Bearbeitung von ${selectedMembers.value.length} Mitgliedern wird implementiert`);
};

const exportSelectedMembers = () => {
	// TODO: Implement CSV export
	console.log('Export selected members:', selectedMembersData.value);
	alert(`Export von ${selectedMembers.value.length} Mitgliedern wird implementiert`);
};

const deleteSelectedMembers = async () => {
	if (confirm(`Sind Sie sicher, dass Sie ${selectedMembers.value.length} ausgewählte Mitglieder löschen möchten?`)) {
		try {
			for (const memberId of selectedMembers.value) {
				await membersStore.deleteMember(memberId);
			}
			selectedMembers.value = [];
		} catch (err) {
			console.error('Error deleting selected members:', err);
		}
	}
};

// Close filter dropdown when clicking outside
const closeFilterOnClickOutside = (event: Event) => {
	if (showStatusFilter.value && !(event.target as Element).closest('.filterable')) {
		showStatusFilter.value = false;
	}
};

// Lifecycle
onMounted(async () => {
	if (members.value.length === 0) {
		await refreshMembers();
	}
	
	// Add click outside listener
	document.addEventListener('click', closeFilterOnClickOutside);
});

// Cleanup
onUnmounted(() => {
	document.removeEventListener('click', closeFilterOnClickOutside);
});
</script>

<style scoped>
.mitglieder-page {
	padding: var(--spacing-lg);
	max-width: 1400px;
	margin: 0 auto;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: var(--spacing-xl);
	gap: var(--spacing-lg);
}

.header-content h1 {
	margin: 0 0 var(--spacing-sm) 0;
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-bold);
	color: var(--color-text);
}

.header-content p {
	margin: 0;
	color: var(--color-text-secondary);
	font-size: var(--font-size-base);
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
}

.stat-card--total {
	border-left: 4px solid var(--color-primary);
}

.stat-card--active {
	border-left: 4px solid var(--color-success);
}

.stat-card--inactive {
	border-left: 4px solid var(--color-warning);
}

.stat-card--suspended {
	border-left: 4px solid var(--color-danger);
}

.stat-icon {
	width: 48px;
	height: 48px;
	border-radius: var(--radius-md);
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--color-white);
}

.stat-card--total .stat-icon {
	background: var(--color-primary);
}

.stat-card--active .stat-icon {
	background: var(--color-success);
}

.stat-card--inactive .stat-icon {
	background: var(--color-warning);
}

.stat-card--suspended .stat-icon {
	background: var(--color-danger);
}

.stat-content {
	flex: 1;
}

.stat-value {
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-bold);
	color: var(--color-text);
	margin: 0 0 var(--spacing-xs) 0;
}

.stat-label {
	font-size: var(--font-size-sm);
	color: var(--color-text-secondary);
	margin: 0;
}

.filters-section {
	margin-bottom: var(--spacing-xl);
}

.filter-tabs {
	display: flex;
	gap: var(--spacing-sm);
	flex-wrap: wrap;
}

.filter-tab {
	padding: var(--spacing-sm) var(--spacing-md);
	border: 1px solid var(--color-gray-300);
	border-radius: var(--radius-md);
	background: var(--color-white);
	color: var(--color-text-secondary);
	font-size: var(--font-size-sm);
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.filter-tab:hover {
	border-color: var(--color-primary);
	color: var(--color-primary);
}

.filter-tab.active {
	background: var(--color-primary);
	border-color: var(--color-primary);
	color: var(--color-white);
}

.filter-count {
	font-size: var(--font-size-xs);
	opacity: 0.8;
}

.table-container {
	background: var(--color-white);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-sm);
	border: 1px solid var(--color-gray-200);
	overflow: hidden;
}

.loading-state,
.error-state {
	padding: var(--spacing-2xl);
	text-align: center;
}

.loading-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid var(--color-gray-200);
	border-top: 4px solid var(--color-primary);
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto var(--spacing-md);
}

@keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.error-icon {
	color: var(--color-danger);
	margin-bottom: var(--spacing-md);
}

.table-wrapper {
	overflow-x: auto;
	overflow-y: visible;
}

/* Custom scrollbar styling */
.table-wrapper::-webkit-scrollbar {
	height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
	background: var(--color-gray-100);
	border-radius: var(--radius-sm);
}

.table-wrapper::-webkit-scrollbar-thumb {
	background: var(--color-gray-400);
	border-radius: var(--radius-sm);
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
	background: var(--color-gray-500);
}

.members-table {
	width: 100%;
	border-collapse: collapse;
	min-width: 1850px;
}

.members-table th {
	background: var(--color-gray-50);
	padding: var(--spacing-sm) var(--spacing-md);
	text-align: left;
	font-weight: var(--font-weight-semibold);
	color: var(--color-text);
	border-bottom: 1px solid var(--color-gray-200);
	font-size: var(--font-size-xs);
	white-space: nowrap;
}

.sortable {
	cursor: pointer;
	user-select: none;
	position: relative;
}

.sortable:hover {
	background: var(--color-gray-100);
}

.sort-indicator {
	margin-left: var(--spacing-xs);
	opacity: 0.5;
}

.sort-indicator.active {
	opacity: 1;
	color: var(--color-primary);
}

.filterable {
	cursor: pointer;
	user-select: none;
	position: relative;
}

.filterable:hover {
	background: var(--color-gray-100);
}

.filter-indicator {
	margin-left: var(--spacing-xs);
	opacity: 0.5;
	font-size: var(--font-size-xs);
}

.filter-indicator.active {
	opacity: 1;
	color: var(--color-primary);
}

.filter-dropdown {
	position: absolute;
	top: 100%;
	left: 0;
	right: 0;
	background: var(--color-white);
	border: 1px solid var(--color-gray-300);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-lg);
	z-index: 1000;
	margin-top: 2px;
	overflow: hidden;
}

.filter-option {
	width: 100%;
	padding: var(--spacing-sm) var(--spacing-md);
	border: none;
	background: var(--color-white);
	color: var(--color-text);
	font-size: var(--font-size-xs);
	text-align: left;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
	transition: background-color 0.2s ease;
}

.filter-option:hover {
	background: var(--color-gray-50);
}

.filter-option.active {
	background: var(--color-primary);
	color: var(--color-white);
}

.filter-count {
	font-size: var(--font-size-xs);
	opacity: 0.8;
}

.active-filter-badge {
	display: inline-block;
	margin-left: var(--spacing-xs);
	padding: 2px 6px;
	background: var(--color-primary);
	color: var(--color-white);
	border-radius: var(--radius-sm);
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-medium);
}

.members-table td {
	padding: var(--spacing-sm) var(--spacing-md);
	border-bottom: 1px solid var(--color-gray-100);
	font-size: var(--font-size-xs);
	vertical-align: top;
}

.member-row:hover {
	background: var(--color-gray-50);
}

.member-name {
	min-width: 200px;
}

.name-cell .full-name {
	font-weight: var(--font-weight-semibold);
	color: var(--color-text);
	margin-bottom: 2px;
}

.name-cell .salutation {
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
}

.member-email {
	min-width: 200px;
}

.email-link {
	color: var(--color-primary);
	text-decoration: none;
}

.email-link:hover {
	text-decoration: underline;
}

.member-number {
	font-family: monospace;
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
	min-width: 120px;
}

.member-since {
	min-width: 120px;
}

.member-status {
	min-width: 100px;
}

.status-badge {
	display: inline-block;
	padding: 4px 8px;
	border-radius: var(--radius-sm);
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-medium);
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.status--active {
	background: rgba(34, 197, 94, 0.1);
	color: var(--color-success);
}

.status--inactive {
	background: rgba(245, 158, 11, 0.1);
	color: var(--color-warning);
}

.status--suspended {
	background: rgba(239, 68, 68, 0.1);
	color: var(--color-danger);
}

.member-city {
	min-width: 120px;
}

.member-birthdate {
	min-width: 120px;
}

.member-actions {
	min-width: 150px;
}

.member-salutation {
	min-width: 80px;
	font-size: var(--font-size-xs);
	color: var(--color-text-secondary);
}

.member-address {
	min-width: 200px;
	font-size: var(--font-size-xs);
}

.member-postal {
	min-width: 80px;
	font-family: monospace;
	font-size: var(--font-size-xs);
}

.member-occupation {
	min-width: 120px;
	font-size: var(--font-size-xs);
}

.member-iban {
	min-width: 180px;
	font-family: monospace;
	font-size: var(--font-size-xs);
	word-break: break-all;
}

.member-bic {
	min-width: 100px;
	font-family: monospace;
	font-size: var(--font-size-xs);
}

.member-school-from,
.member-school-to {
	min-width: 100px;
	font-size: var(--font-size-xs);
}

.action-buttons {
	display: flex;
	gap: var(--spacing-xs);
}

/* Mobile Responsive */
@media (max-width: 768px) {
	.mitglieder-page {
		padding: var(--spacing-md);
	}

	.page-header {
		flex-direction: column;
		align-items: stretch;
		gap: var(--spacing-md);
	}

	.stats-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-md);
	}

	.filter-tabs {
		justify-content: center;
	}

	/* Mobile Table - Card Layout */
	.table-wrapper {
		overflow: visible;
	}

	.members-table {
		display: block;
		min-width: unset;
	}

	.members-table thead {
		display: none;
	}

	.members-table tbody {
		display: block;
	}

	.members-table tr {
		display: block;
		background: var(--color-white);
		border: 1px solid var(--color-gray-200);
		border-radius: var(--radius-lg);
		margin-bottom: var(--spacing-md);
		padding: var(--spacing-lg);
		box-shadow: var(--shadow-sm);
	}

	.members-table td {
		display: block;
		padding: var(--spacing-xs) 0;
		border: none;
		text-align: left;
		position: relative;
		padding-left: 120px;
	}

	.members-table td:before {
		content: attr(data-label);
		position: absolute;
		left: 0;
		width: 100px;
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-secondary);
		font-size: var(--font-size-xs);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Checkbox in mobile cards */
	.member-checkbox {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		width: auto;
		padding: 0;
	}

	.member-checkbox:before {
		display: none;
	}

	/* Name cell special styling */
	.name-cell {
		padding-left: 0 !important;
		margin-bottom: var(--spacing-sm);
		border-bottom: 1px solid var(--color-gray-100);
		padding-bottom: var(--spacing-sm);
	}

	.name-cell:before {
		display: none;
	}

	.name-cell .full-name {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		margin-bottom: 4px;
	}

	.name-cell .salutation {
		font-size: var(--font-size-sm);
	}

	/* Status badge mobile */
	.status-badge {
		font-size: var(--font-size-xs);
		padding: 6px 12px;
	}

	/* Action buttons mobile */
	.member-actions {
		padding-left: 0 !important;
		margin-top: var(--spacing-md);
		border-top: 1px solid var(--color-gray-100);
		padding-top: var(--spacing-sm);
	}

	.member-actions:before {
		display: none;
	}

	.action-buttons {
		justify-content: center;
		gap: var(--spacing-sm);
	}

	/* Hide less important fields on mobile */
	.member-iban,
	.member-bic,
	.member-school-from,
	.member-school-to {
		display: none;
	}

	/* Filter dropdown mobile */
	.filter-dropdown {
		right: 0;
		left: auto;
		width: 200px;
	}

	/* Actions bar mobile */
	.actions-bar {
		flex-direction: column;
		gap: var(--spacing-md);
		align-items: stretch;
	}

	.actions-bar .action-buttons {
		justify-content: center;
		flex-wrap: wrap;
	}
}

@media (max-width: 480px) {
	.stats-grid {
		grid-template-columns: 1fr;
	}

	.stat-card {
		padding: var(--spacing-md);
	}

	.filter-tab {
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-xs);
	}

	/* Extra small screens - further optimize */
	.mitglieder-page {
		padding: var(--spacing-sm);
	}

	.members-table tr {
		padding: var(--spacing-md);
	}

	.members-table td {
		padding-left: 100px;
		font-size: var(--font-size-sm);
	}

	.members-table td:before {
		width: 80px;
		font-size: var(--font-size-xs);
	}

	.name-cell .full-name {
		font-size: var(--font-size-base);
	}

	.action-buttons {
		gap: var(--spacing-xs);
	}

	.action-buttons .tom-btn {
		min-width: 36px;
		min-height: 36px;
	}

	/* Hide even more fields on very small screens */
	.member-occupation,
	.member-address,
	.member-postal {
		display: none;
	}
}

/* Actions Bar Styles */
.actions-bar {
	background: var(--color-white);
	border: 1px solid var(--color-gray-200);
	border-radius: var(--radius-lg);
	padding: var(--spacing-md) var(--spacing-lg);
	margin-bottom: var(--spacing-lg);
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: var(--shadow-sm);
}

.selected-info {
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
}

.selected-count {
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	color: var(--color-text);
	background: var(--color-primary);
	color: var(--color-white);
	padding: var(--spacing-xs) var(--spacing-sm);
	border-radius: var(--radius-sm);
}

.actions-bar .action-buttons {
	display: flex;
	gap: var(--spacing-sm);
	align-items: center;
}

/* Checkbox Styles */
.checkbox-header {
	width: 40px;
	text-align: center;
	padding: var(--spacing-sm) var(--spacing-md);
}

.select-all-checkbox {
	width: 16px;
	height: 16px;
	cursor: pointer;
}

.member-checkbox {
	width: 40px;
	text-align: center;
	padding: var(--spacing-sm) var(--spacing-md);
}

.member-checkbox-input {
	width: 16px;
	height: 16px;
	cursor: pointer;
}

/* Mobile Actions Bar */
@media (max-width: 768px) {
	.actions-bar {
		flex-direction: column;
		gap: var(--spacing-md);
		align-items: stretch;
		padding: var(--spacing-md);
	}

	.actions-bar .action-buttons {
		justify-content: center;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}

	.actions-bar .tom-btn {
		flex: 1;
		min-width: 120px;
	}
}

@media (max-width: 480px) {
	.actions-bar {
		padding: var(--spacing-sm);
	}

	.actions-bar .action-buttons {
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.actions-bar .tom-btn {
		width: 100%;
		min-width: unset;
	}
}
</style>
