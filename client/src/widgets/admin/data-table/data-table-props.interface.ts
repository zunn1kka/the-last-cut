import { Column } from './column.interface'

export interface DataTableProps {
	data: any[]
	columns: Column[]
	loading?: boolean
	onEdit?: (id: string) => void | string
	onDelete?: (id: string) => void
	itemsPerPage?: number
}
