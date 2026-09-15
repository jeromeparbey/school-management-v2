// frontend2/src/components/layout/SidebarGroup.tsx
import React from 'react';
import type { NavGroup } from '../config/navigation.types';
import SidebarItem from './SidebarItem';

interface Props {
  group: NavGroup;
  currentPath: string;
}

const SidebarGroup: React.FC<Props> = ({ group, currentPath }) => (
  <div>
    <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
      {group.title}
    </p>
    <div className="space-y-0.5">
      {group.items.map((item) => (
        <SidebarItem key={item.label} item={item} currentPath={currentPath} />
      ))}
    </div>
  </div>
);

export default SidebarGroup;