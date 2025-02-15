import { promises as fs } from 'fs';
import path from 'path';
import { Project } from '../types/evaluation';

const DATA_FILE = path.join(process.cwd(), 'src/data/projects.json');

export async function getProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data).projects;
  } catch (error) {
    console.error('Error reading projects:', error);
    return [];
  }
}

export async function saveProject(project: Project): Promise<boolean> {
  try {
    const projects = await getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }

    await fs.writeFile(DATA_FILE, JSON.stringify({ projects }, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving project:', error);
    return false;
  }
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    const projects = await getProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    await fs.writeFile(DATA_FILE, JSON.stringify({ projects: filteredProjects }, null, 2));
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}
