import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ArrowDown, Trash2, FileCode, Loader2 } from 'lucide-react'
import { cn, getDirectImageUrl } from '@/lib/utils'
import { BlurImage } from '@/components/ui/blur-image'
import { Project } from './types'
import { SUBCATEGORY_MAP } from './types'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  orderList: Project[]
  onReorder: (newList: Project[]) => void
  onSave: () => Promise<void>
  isPending: boolean
  title: string
  description: string
  currentProjectId?: string
  showUnfeatureButton?: boolean
  onUnfeature?: (id: string) => void
}

export function OrderModal({
  isOpen,
  onClose,
  orderList,
  onReorder,
  onSave,
  isPending,
  title,
  description,
  currentProjectId,
  showUnfeatureButton = false,
  onUnfeature
}: OrderModalProps) {
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newList = [...orderList]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= newList.length) return
    
    const temp = newList[index]
    newList[index] = newList[targetIndex]
    newList[targetIndex] = temp
    
    onReorder(newList)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl rounded-3xl border border-slate-200/10 dark:border-slate-800/10 bg-slate-900/95 dark:bg-slate-950/95 p-6 shadow-2xl text-foreground flex flex-col max-h-[85vh] overflow-hidden"
        >
          <div className="flex justify-between items-start pb-4 border-b border-slate-200/10 dark:border-slate-800/10">
            <div>
              <h3 className="text-lg font-black tracking-tight text-foreground">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg text-muted-foreground">
                Total: {orderList.length} Items
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[200px]">
            {orderList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No projects in this list.
              </p>
            ) : (
              <AnimatePresence mode="popLayout">
                {orderList.map((proj, idx) => {
                  const isCurrent = proj.id === (currentProjectId || 'temp-current-id')
                  
                  return (
                    <motion.div
                      key={proj.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                        isCurrent
                          ? "bg-primary/10 border-primary/30 shadow-md shadow-primary/5"
                          : "bg-slate-900/50 dark:bg-slate-950/40 border-slate-200/5 dark:border-slate-800/10 hover:border-slate-800/30"
                      )}
                    >
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveItem(idx, 'up')}
                          className={cn(
                            "p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                          )}
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === orderList.length - 1}
                          onClick={() => moveItem(idx, 'down')}
                          className={cn(
                            "p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-20 disabled:pointer-events-none"
                          )}
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-12 h-8 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative flex items-center justify-center border border-slate-800/50">
                        {proj.cover_image ? (
                          <BlurImage
                            src={getDirectImageUrl(proj.cover_image, 100)}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <FileCode className="w-4 h-4 text-muted-foreground/30" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={cn(
                            "text-xs font-semibold truncate",
                            isCurrent ? "text-foreground font-black" : "text-muted-foreground hover:text-foreground"
                          )}>
                            {proj.title}
                          </h4>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[8px] font-black uppercase rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 truncate">
                          {SUBCATEGORY_MAP[proj.sub_category] || proj.sub_category.replace(' Projects', '')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 bg-slate-800 dark:bg-slate-900 text-muted-foreground text-[10px] font-mono rounded-lg border border-slate-700/30">
                          Order: {idx + 1}
                        </span>
                        {showUnfeatureButton && onUnfeature && (
                          <button
                            type="button"
                            onClick={() => onUnfeature(proj.id)}
                            className="p-1.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            title="Remove from Featured"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/10 dark:bg-slate-950/10 dark:border-slate-800/10">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-bold border border-slate-200/10 dark:border-slate-800/10 text-foreground hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={onSave}
              className="py-2 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/95 transition-all cursor-pointer disabled:opacity-55"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Order</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
