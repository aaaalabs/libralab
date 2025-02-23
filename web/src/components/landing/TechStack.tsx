import { Badge } from "@tremor/react";

export const techStack = [
  { name: 'TypeScript', color: 'blue' },
  { name: 'React', color: 'cyan' },
  { name: 'Next.js', color: 'gray' },
  { name: 'Node.js', color: 'green' },
  { name: 'Python', color: 'yellow' },
] as const;

export const TechStack = () => {
  return (
    <div className="flex flex-wrap gap-2">
      {techStack.map((tech) => (
        <Badge key={tech.name} color={tech.color as any}>
          {tech.name}
        </Badge>
      ))}
    </div>
  );
};
