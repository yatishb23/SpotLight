"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreHorizontal,
  Search,
  UserPlus,
  FileDown,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { apiClient, createUser } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAdminUsers();
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.data)
          ? (data as any).data
          : [];
      setUsers(normalized);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      setIsSubmitting(true);
      const created = await createUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        password: "123",
      });
      const user = (created as any)?.data ?? created;
      setUsers((prev) => [...prev, user]);
      setIsAddUserOpen(false);
      setNewUser({ name: "", email: "", role: "user", phone: "", address: "" });
      toast.success("User created");
    } catch {
      toast.error("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      const newStatus = !status;
      await apiClient.updateAdminUserStatus(id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: newStatus } : u)),
      );
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete user?")) return;
    try {
      await apiClient.deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const filterUsers = (role: string) => {
    return users.filter((u) => {
      const match =
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());

      if (role === "all") return match;
      return match && u.role === role;
    });
  };

  const UserTable = ({ data }: { data: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow className="border-white/[0.05]">
          <TableHead className="text-[10px] text-white/20 uppercase tracking-widest">
            User
          </TableHead>
          <TableHead className="text-[10px] text-white/20 uppercase tracking-widest">
            Role
          </TableHead>
          <TableHead className="text-[10px] text-white/20 uppercase tracking-widest">
            Status
          </TableHead>
          <TableHead className="text-[10px] text-white/20 uppercase tracking-widest">
            Joined
          </TableHead>
          <TableHead className="text-right text-[10px] text-white/20 uppercase tracking-widest">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((user) => (
          <TableRow
            key={user.id}
            className="border-white/[0.04] hover:bg-white/[0.02]"
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-white/[0.08]">
                  <AvatarImage src={user.image} />
                  <AvatarFallback className="bg-white/[0.04] text-white/40">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="text-sm text-white">{user.name}</p>
                  <p className="text-[11px] text-white/30">{user.email}</p>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-md border",
                  user.role === "admin"
                    ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                    : user.role === "organizer"
                      ? "text-white/60 border-white/10 bg-white/5"
                      : "text-white/30 border-white/[0.06]",
                )}
              >
                {user.role}
              </span>
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    user.isActive ? "bg-emerald-500" : "bg-white/20",
                  )}
                />
                <span className="text-[11px] text-white/40">
                  {user.isActive ? "Active" : "Disabled"}
                </span>
              </div>
            </TableCell>

            <TableCell className="text-[11px] text-white/30">
              {new Date(user.createdAt || Date.now()).toLocaleDateString(
                "en-IN",
                { day: "2-digit", month: "short" },
              )}
            </TableCell>

            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 text-white/30 hover:text-white hover:bg-white/[0.05]"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="bg-[#050505] border border-white/[0.08]"
                >
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(user.id)}
                  >
                    Copy ID
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleStatusChange(user.id, user.isActive)}
                  >
                    {user.isActive ? "Disable" : "Enable"}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-red-400"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
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
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 border-b border-white/[0.04] pb-10">
        <div>
          <p className="text-[11px] text-white/25">Administrator</p>
          <h1 className="text-2xl font-light text-white">User Management</h1>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-white/[0.08] text-white/40"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white text-black">Add User</Button>
            </DialogTrigger>

            <DialogContent className="bg-[#050505] border border-white/[0.08]">
              <DialogHeader>
                <DialogTitle>Create User</DialogTitle>
                <DialogDescription className="text-white/40">
                  Default password will be assigned.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="bg-white/[0.03] border-white/[0.08]"
                />
                <Input
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="bg-white/[0.03] border-white/[0.08]"
                />
                <Input
                  placeholder="Phone"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="bg-white/[0.03] border-white/[0.08]"
                />
                <Input
                  placeholder="Address"
                  value={newUser.address}
                  onChange={(e) =>
                    setNewUser({ ...newUser, address: e.target.value })
                  }
                  className="bg-white/[0.03] border-white/[0.08]"
                />
                <Select
                  value={newUser.role}
                  onValueChange={(v) => setNewUser({ ...newUser, role: v })}
                >
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.08]" />
                  <SelectContent className="bg-[#050505] border-white/[0.08]">
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleAddUser}
                  className="w-full bg-white text-black"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs + Table */}
      <Tabs defaultValue="all">
        <div className="flex justify-between mb-6">
          <TabsList className="bg-white/[0.03] border border-white/[0.06]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="organizer">Organizers</TabsTrigger>
            <TabsTrigger value="user">Users</TabsTrigger>
          </TabsList>

          <Input
            placeholder="Search..."
            className="max-w-sm bg-white/[0.03] border-white/[0.06]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <TabsContent value="all">
            <UserTable data={filterUsers("all")} />
          </TabsContent>
          <TabsContent value="admin">
            <UserTable data={filterUsers("admin")} />
          </TabsContent>
          <TabsContent value="organizer">
            <UserTable data={filterUsers("organizer")} />
          </TabsContent>
          <TabsContent value="user">
            <UserTable data={filterUsers("user")} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
