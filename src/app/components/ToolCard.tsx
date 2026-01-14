// src/app/components/ToolCard.tsx
import { ArrowTurnDownLeftIcon, CodeBracketIcon } from '@heroicons/react/20/solid';

interface ToolCardProps {
  href: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function ToolCard({ href, title, description, icon }: ToolCardProps) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between p-4 rounded-xl border transition-all duration-300
        /* 浅色模式样式 */
        bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-[#F97316]/50
        /* 深色模式样式 */
        dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10 dark:hover:border-[#F97316]/30"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
          {icon || <CodeBracketIcon className="w-6 h-6 text-white" />}
        </div>
        <div className="text-left">
          <h4 className="font-semibold text-slate-800 dark:text-white group-hover:text-[#F97316] transition-colors">
            {title}
          </h4>
          <p className="text-slate-500 dark:text-gray-400 text-sm line-clamp-1">{description}</p>
        </div>
      </div>
      <ArrowTurnDownLeftIcon className="w-5 h-5 text-slate-300 dark:text-gray-500 group-hover:text-[#F97316] dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
    </a>
  );
}