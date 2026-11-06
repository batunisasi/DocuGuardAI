
export const user = { name: 'Ummu Diana', firstName: 'Diana', role: 'Peninjau Layanan TI', initials: 'UD' }

import { SCREENS } from './screens'

export const nav = SCREENS.map((s) => ({ id: s.id, label: s.label, icon: s.icon, group: s.group, live: true as const }))
