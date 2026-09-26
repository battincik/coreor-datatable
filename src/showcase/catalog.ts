import { Database, Download, Filter, Layers3, MousePointer2, SlidersHorizontal, Sparkles } from 'lucide-react'

export const features = [
  { slug:'filters', name:'Typed filters', icon:Filter, description:'Ranges, multi-select values, dates and search matched to each column type.', keys:['name','status','tags','price','due','rating'], count:480, tips:['Click Filter in the grid toolbar.','Combine a price range with two statuses.','Set Tags to match any or all values.'] },
  { slug:'editing', name:'Cell editors', icon:MousePointer2, description:'Edit in place, validate values and undo or redo changes.', keys:['name','email','progress','price','rating','enabled','color'], count:160, tips:['Double-click a value to open its editor.','Enter saves, Escape cancels.','Try an invalid email, then use Undo and Redo.'] },
  { slug:'selection', name:'Selection & export', icon:Download, description:'Select rows across pages and export a page, selection or filtered results.', keys:['name','status','country','price','enabled'], count:320, tips:['Use the header checkbox to select this page.','Move to the next page and select more.','Export selected or all filtered rows.'] },
  { slug:'pagination', name:'Pagination', icon:Layers3, description:'Move between pages and change page size without losing your work.', keys:['name','owner','status','price','timestamp'], count:640, tips:['Use the page controls below the table.','Change Rows per page to 25 or 250.','Sort a column and watch the page reset.'] },
  { slug:'columns', name:'Column controls', icon:SlidersHorizontal, description:'Hide, pin, resize and sort columns; switch row density.', keys:['name','owner','status','country','price','progress','trend','timestamp'], count:480, tips:['Hover a header to open its menu.','Pin a column and scroll horizontally.','Drag the header edge to resize, or hide columns.'] },
  { slug:'virtualization', name:'Virtualization', icon:Database, description:'Work with 10,000 rows while drawing only the visible ones.', keys:['name','status','progress','price','tags','trend','timestamp'], count:10000, tips:['Scroll quickly through the table.','Change the grid height in Live controls.','Search and sort the 10,000-row data set.'] },
  { slug:'timestamps', name:'Live timestamps', icon:Sparkles, description:'Switch between nine timestamp styles and inspect exact dates in a tooltip.', keys:['name','status','timestamp','due'], count:180, tips:['Try the R relative-time format.','Change the format without remounting the grid.','Hover or focus the timestamp for its exact date.'] },
] as const
export type FeatureSlug = typeof features[number]['slug']
export const presets = [
  { slug:'renewals', name:'Renewals', description:'Revenue, stages and account health.', count:'10,000' },
  { slug:'inventory', name:'Inventory', description:'Warehouses, stock and reorder points.', count:'12,000' },
  { slug:'invoices', name:'Invoices', description:'Payments, due dates and balances.', count:'1,800' },
] as const
