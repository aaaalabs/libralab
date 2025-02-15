import { cn } from "@/lib/utils"
import { RecentPost } from "./components/post"
import { Dashboard } from '../components/dashboard/Dashboard';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <Dashboard />
    </main>
  )
}
