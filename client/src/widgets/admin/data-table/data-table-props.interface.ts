import { Column } from './column.interface'

export interface DataTableProps {
	data: any[]
	columns: Column[]
	onDelete?: (id: string) => void
	onEdit?: (item: any) => void
	searchPlaceholder?: string
	searchFields?: string[]
	loading?: boolean
}
