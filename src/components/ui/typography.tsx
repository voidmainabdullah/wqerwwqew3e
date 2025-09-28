import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

// Heading Components with Unbounded font
export const H1: React.FC<TypographyProps> = ({ children, className }) => (
  <h1 className={cn("text-4xl font-heading font-bold tracking-tight lg:text-5xl", className)}>
    {children}
  </h1>
);

export const H2: React.FC<TypographyProps> = ({ children, className }) => (
  <h2 className={cn("text-3xl font-heading font-semibold tracking-tight", className)}>
    {children}
  </h2>
);

export const H3: React.FC<TypographyProps> = ({ children, className }) => (
  <h3 className={cn("text-2xl font-heading font-semibold tracking-tight", className)}>
    {children}
  </h3>
);

export const H4: React.FC<TypographyProps> = ({ children, className }) => (
  <h4 className={cn("text-xl font-heading font-semibold tracking-tight", className)}>
    {children}
  </h4>
);

// Body Text Components with Rationale font
export const BodyText: React.FC<TypographyProps> = ({ children, className }) => (
  <p className={cn("leading-7 font-body", className)}>
    {children}
  </p>
);

export const SmallText: React.FC<TypographyProps> = ({ children, className }) => (
  <small className={cn("text-sm font-body font-medium leading-none", className)}>
    {children}
  </small>
);

export const MutedText: React.FC<TypographyProps> = ({ children, className }) => (
  <p className={cn("text-sm font-body text-muted-foreground", className)}>
    {children}
  </p>
);

// Specialized Components
export const Lead: React.FC<TypographyProps> = ({ children, className }) => (
  <p className={cn("text-xl font-body text-muted-foreground", className)}>
    {children}
  </p>
);

export const Large: React.FC<TypographyProps> = ({ children, className }) => (
  <div className={cn("text-lg font-heading font-semibold", className)}>
    {children}
  </div>
);

export const Code: React.FC<TypographyProps> = ({ children, className }) => (
  <code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)}>
    {children}
  </code>
);

// List Components
interface ListProps {
  children: React.ReactNode;
  className?: string;
}

export const List: React.FC<ListProps> = ({ children, className }) => (
  <ul className={cn("my-6 ml-6 list-disc font-body", className)}>
    {children}
  </ul>
);

export const ListItem: React.FC<TypographyProps> = ({ children, className }) => (
  <li className={cn("mt-2 font-body", className)}>
    {children}
  </li>
);

// Blockquote
export const Blockquote: React.FC<TypographyProps> = ({ children, className }) => (
  <blockquote className={cn("mt-6 border-l-2 pl-6 italic font-body", className)}>
    {children}
  </blockquote>
);

// Table Components
export const Table: React.FC<TypographyProps> = ({ children, className }) => (
  <div className={cn("my-6 w-full overflow-y-auto", className)}>
    <table className="w-full font-body">
      {children}
    </table>
  </div>
);

export const TableRow: React.FC<TypographyProps> = ({ children, className }) => (
  <tr className={cn("m-0 border-t p-0 even:bg-muted", className)}>
    {children}
  </tr>
);

export const TableHead: React.FC<TypographyProps> = ({ children, className }) => (
  <th className={cn("border px-4 py-2 text-left font-heading font-bold [&[align=center]]:text-center [&[align=right]]:text-right", className)}>
    {children}
  </th>
);

export const TableCell: React.FC<TypographyProps> = ({ children, className }) => (
  <td className={cn("border px-4 py-2 text-left font-body [&[align=center]]:text-center [&[align=right]]:text-right", className)}>
    {children}
  </td>
);