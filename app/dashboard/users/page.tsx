"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreHorizontal,
  Search,
  UserPlus,
  FileDown,
  Loader2,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAdminUsers();
      if (data) {
        const normalizedUsers = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.data)
            ? (data as any).data
            : [];
        setUsers(normalizedUsers);
      }
    } catch (error) {
      toast.error("Security sync failed: Could not load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      setIsSubmitting(true);
      const createdUser = await apiClient.createAdminUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: "123",
      });
      const normalizedCreatedUser = (createdUser as any)?.data ?? createdUser;
      setUsers((prevUsers) => [...prevUsers, normalizedCreatedUser]);
      setIsAddUserOpen(false);
      setNewUser({ name: "", email: "", role: "user" });
      toast.success(`User identity verified: ${newUser.name}`);
    } catch (error: any) {
      toast.error(error.message || "Credential creation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await apiClient.updateAdminUserStatus(userId, newStatus);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isActive: newStatus } : user,
        ),
      );
      toast.success(`Access level ${newStatus ? "Restored" : "Revoked"}`);
    } catch (error) {
      toast.error("Status update protocol failed");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Confirm permanent deletion of user account?")) return;
    try {
      await apiClient.deleteAdminUser(userId);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      toast.success("User record purged from system");
    } catch (error) {
      toast.error("Purge protocol failed");
    }
  };

  const filterUsers = (role: string) => {
    return users.filter((user) => {
      const matchesSearch =
        (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      if (role === "all") return matchesSearch;
      return matchesSearch && user.role?.toLowerCase() === role;
    });
  };

  const UserTable = ({ data }: { data: any[] }) => (
    <Table>
      <TableHeader className="bg-neutral-900/50">
        <TableRow className="border-neutral-800 hover:bg-transparent">
          <TableHead className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Identity</TableHead>
          <TableHead className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Classification</TableHead>
          <TableHead className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Status</TableHead>
          <TableHead className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Registered</TableHead>
          <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold text-neutral-500">Controls</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user) => (
          <TableRow key={user.id} className="border-neutral-900 hover:bg-neutral-900/30 transition-colors">
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-neutral-800">
                  <AvatarImage src={user.image} />
                  <AvatarFallback className="bg-neutral-900 text-neutral-400">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-neutral-200">{user.name}</span>
                  <span className="text-[11px] font-mono text-neutral-500">{user.email}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={`text-[10px] uppercase font-bold px-2 py-0 border-neutral-800 ${
                user.role === 'admin' ? 'text-red-400' : user.role === 'organizer' ? 'text-blue-400' : 'text-neutral-500'
              }`}>
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-neutral-700'}`} />
                <span className={`text-xs ${user.isActive ? 'text-neutral-300' : 'text-neutral-600'}`}>
                  {user.isActive ? "Active" : "Disabled"}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-xs text-neutral-500 font-mono">
              {new Date(user.createdAt || Date.now()).toLocaleDateString('en-GB')}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 text-neutral-500 hover:text-white hover:bg-neutral-800">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-neutral-300">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-tighter text-neutral-500">Command</DropdownMenuLabel>
                  <DropdownMenuItem className="focus:bg-neutral-800 focus:text-white" onClick={() => navigator.clipboard.writeText(user.id)}>
                    Copy UID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-neutral-800" />
                  <DropdownMenuItem className="focus:bg-neutral-800 focus:text-white" onClick={() => handleStatusChange(user.id, user.isActive)}>
                    {user.isActive ? "Revoke Access" : "Grant Access"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-neutral-800" />
                  <DropdownMenuItem className="text-red-400 focus:bg-red-950 focus:text-red-300" onClick={() => handleDeleteUser(user.id)}>
                    Purge Identity
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-700" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">Synchronizing Database</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 p-2 md:p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-neutral-900 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">System Governance</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-medium tracking-tight text-white">Users</h1>
            <p className="text-sm text-neutral-500 font-light">Identity management and access control protocols.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-transparent border-neutral-800 hover:bg-neutral-900 text-neutral-400">
            <FileDown className="mr-2 h-4 w-4" /> Export Ledger
          </Button>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black hover:bg-neutral-200">
                <UserPlus className="mr-2 h-4 w-4" /> Initialize User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-950 border-neutral-800 text-neutral-200">
              <DialogHeader>
                <DialogTitle className="text-white">Initialize New Identity</DialogTitle>
                <DialogDescription className="text-neutral-500">System will assign default credentials upon creation.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] uppercase tracking-widest text-neutral-500">Legal Name</Label>
                  <Input id="name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="bg-neutral-900 border-neutral-800" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-neutral-500">Electronic Mail</Label>
                  <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="bg-neutral-900 border-neutral-800" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-[10px] uppercase tracking-widest text-neutral-500">Classification</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger className="bg-neutral-900 border-neutral-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddUser} disabled={isSubmitting} className="w-full bg-white text-black hover:bg-neutral-200">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Execute Initialization
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <TabsList className="bg-neutral-900 border border-neutral-800 p-1 h-11">
              <TabsTrigger value="all" className="data-[state=active]:bg-neutral-800 px-6 text-xs uppercase tracking-tighter">All</TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-neutral-800 px-6 text-xs uppercase tracking-tighter">Admins</TabsTrigger>
              <TabsTrigger value="organizer" className="data-[state=active]:bg-neutral-800 px-6 text-xs uppercase tracking-tighter">Organizers</TabsTrigger>
              <TabsTrigger value="user" className="data-[state=active]:bg-neutral-800 px-6 text-xs uppercase tracking-tighter">Citizens</TabsTrigger>
            </TabsList>

            <div className="relative w-full max-w-sm group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600 group-focus-within:text-white transition-colors" />
              <Input
                placeholder="Query identity name or email..."
                className="pl-10 bg-neutral-900 border-neutral-800 focus:ring-1 focus:ring-neutral-700 h-11 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="mt-8 bg-transparent border-neutral-900">
            <CardContent className="p-0">
              <TabsContent value="all" className="m-0"><UserTable data={filterUsers("all")} /></TabsContent>
              <TabsContent value="admin" className="m-0"><UserTable data={filterUsers("admin")} /></TabsContent>
              <TabsContent value="organizer" className="m-0"><UserTable data={filterUsers("organizer")} /></TabsContent>
              <TabsContent value="user" className="m-0"><UserTable data={filterUsers("user")} /></TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}