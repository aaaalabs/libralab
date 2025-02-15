import { Card, Title, BarList } from '@tremor/react';
import { Project } from '../../types/evaluation';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject }) => {
  const projectData = projects.map(project => ({
    name: project.name,
    value: project.metrics.RICE.Impact.value || 0,
    icon: () => (
      <span className={`
        h-2 w-2 rounded-full 
        ${project.status === 'approved' ? 'bg-green-500' : 
          project.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}
      `} />
    ),
    onClick: () => onSelectProject(project)
  }));

  return (
    <Card className="max-w-md mx-auto">
      <Title>Projekte</Title>
      <BarList 
        data={projectData}
        className="mt-4"
      />
    </Card>
  );
};
