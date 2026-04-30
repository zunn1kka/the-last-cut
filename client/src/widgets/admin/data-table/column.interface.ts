export interface Column {
	key: string
	label: string
	type?: 'text' | 'image' | 'actions'
	render?: (item: any) => React.ReactNode
}
