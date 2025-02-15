import { useState, useEffect } from 'react';
import { Grid, Card, Title, Text } from '@tremor/react';
import { Project } from '../../types/evaluation';
import { ProjectList } from './ProjectList';
import { ProjectMetrics } from './ProjectMetrics';
import { ScoreChart } from './ScoreChart';
import { getProjects } from '../../utils/dataManager';
import { evaluateProject } from '../../utils/evaluationLogic';

export const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0]);
        }
      } catch (err) {
        setError('Fehler beim Laden der Projekte');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (loading) {
    return (
      <Card>
        <Text>Lade Projekte...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Text color="red">{error}</Text>
      </Card>
    );
  }

  return (
    <div className="p-4">
      <Title className="mb-4">Projekt Evaluierung Dashboard</Title>
      
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        {/* Project List */}
        <ProjectList 
          projects={projects}
          onSelectProject={setSelectedProject}
        />

        {/* Score Chart */}
        {selectedProject?.metrics && (
          <ScoreChart
            result={evaluateProject(selectedProject)}
          />
        )}
      </Grid>

      {/* Project Metrics */}
      {selectedProject && (
        <div className="mt-6">
          <Title className="mb-4">{selectedProject.name}</Title>
          <ProjectMetrics project={selectedProject} />
          
          {/* Recommendation Card */}
          <Card className="mt-4">
            <Title>Empfehlung</Title>
            <Text className="mt-2">
              {evaluateProject(selectedProject).recommendation}
            </Text>
          </Card>
        </div>
      )}
    </div>
  );
};
