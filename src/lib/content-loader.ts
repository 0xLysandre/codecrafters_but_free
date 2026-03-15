import fs from "fs";
import path from "path";
import yaml from "yaml";

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

export interface ProjectContent {
  project: {
    id: string;
    title: string;
    slug: string;
    icon: string;
    difficulty: string;
    estimated_hours: number;
    prerequisites: string[];
    description: string;
    concepts: string[];
    supported_languages: string[];
    stages: StageContent[];
  };
}

export interface StageContent {
  id: string;
  number: number;
  title: string;
  narrative: string;
  task: string;
  concepts_taught: string[];
  hints: { level: number; text: string }[];
  reference_material?: {
    title: string;
    body: string;
    diagram?: string;
  };
  test_config: {
    timeout_seconds: number;
    test_type: string;
    test_script?: string;
    setup_commands?: string[];
  };
}

/**
 * Load a project definition from a YAML file.
 */
export function loadProject(projectDir: string): ProjectContent | null {
  const yamlPath = path.join(CONTENT_DIR, projectDir, "project.yaml");

  if (!fs.existsSync(yamlPath)) {
    return null;
  }

  const content = fs.readFileSync(yamlPath, "utf8");
  return yaml.parse(content) as ProjectContent;
}

/**
 * Load all projects from the content directory.
 */
export function loadAllProjects(): ProjectContent[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const dirs = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const projects: ProjectContent[] = [];

  for (const dir of dirs) {
    if (!dir.isDirectory()) continue;
    const project = loadProject(dir.name);
    if (project) projects.push(project);
  }

  return projects;
}

/**
 * Load starter code for a specific stage and language.
 */
export function loadStarterCode(
  projectDir: string,
  stageDir: string,
  language: string
): Record<string, string> | null {
  const starterDir = path.join(
    CONTENT_DIR,
    projectDir,
    "starters",
    language,
    stageDir
  );

  if (!fs.existsSync(starterDir)) return null;

  const files: Record<string, string> = {};
  const entries = fs.readdirSync(starterDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile()) {
      files[entry.name] = fs.readFileSync(
        path.join(starterDir, entry.name),
        "utf8"
      );
    }
  }

  return Object.keys(files).length > 0 ? files : null;
}

/**
 * Load a test script for a specific stage.
 */
export function loadTestScript(
  projectDir: string,
  testScript: string
): string | null {
  const testPath = path.join(CONTENT_DIR, projectDir, "tests", testScript);

  if (!fs.existsSync(testPath)) return null;

  return fs.readFileSync(testPath, "utf8");
}
