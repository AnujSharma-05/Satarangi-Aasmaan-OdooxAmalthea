import { useState, useCallback } from "react";
import api from "../services/api";
import type { User } from "../types";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let fetchedUsers: User[];
      try {
        fetchedUsers = await api.users.getAll();
      } catch (e) {
        console.warn("Failed to fetch users from API, using mock data:", e);
        // TODO: Remove mock data once API is ready
        fetchedUsers = [
          // ... your mock users here
        ];
      }
      setUsers(fetchedUsers);
    } catch (e) {
      console.error("Error fetching users:", e);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: Omit<User, "id">) => {
    setError(null);
    try {
      let newUser: User;
      try {
        newUser = await api.users.create(userData);
      } catch (e) {
        console.warn("Failed to create user via API, using mock data:", e);
        // TODO: Remove mock creation once API is ready
        newUser = {
          ...userData,
          id: `user-${Date.now()}`,
        };
      }
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (e) {
      console.error("Error creating user:", e);
      setError("Failed to create user. Please try again.");
      throw e;
    }
  }, []);

  const updateUser = useCallback(
    async (userId: string, updateData: Partial<User>) => {
      setError(null);
      try {
        let updatedUser: User;
        try {
          updatedUser = await api.users.update(userId, updateData);
        } catch (e) {
          console.warn("Failed to update user via API, using mock update:", e);
          // TODO: Remove mock update once API is ready
          updatedUser = {
            ...users.find((user) => user.id === userId)!,
            ...updateData,
          } as User;
        }
        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? updatedUser : user))
        );
        return updatedUser;
      } catch (e) {
        console.error("Error updating user:", e);
        setError("Failed to update user. Please try again.");
        throw e;
      }
    },
    [users]
  );

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    setUsers, // For mock data updates
  };
};
