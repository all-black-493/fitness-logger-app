import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"

export function CommunitiesHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
        <p className="text-muted-foreground">Join fitness communities, share progress, and get motivated together</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search communities..." className="w-full pl-8 md:w-[200px] lg:w-[300px]" />
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="mr-2 h-4 w-4" />
          Create Community
        </Button>
      </div>
    </div>
  )
}
