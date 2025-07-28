//students/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { API_URL } from '../../../lib/config';
import { getValidToken, getUserFromToken } from '../../../lib/auth';

type Student = {
  id: string;
  name: string;
  department: string;
  marks: number;
};

type JwtPayload = {
  userId: string;
  role: string;
  department: string;
};

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found');

        const user = getUserFromToken();
        if (!user) throw new Error('Invalid token');

        setIsAdmin(user.role === 'admin');

        if (user.role !== 'admin') return;
        if (token) {
          try {
            // Log the decoded token parts
            const parts = token.split('.');
            console.log("Token format valid:", parts.length === 3);
          } catch (e) {
            console.error("Token parsing error:", e);
          }
        }
        const res = await fetch(`${API_URL}/api/students/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          console.error(`API Error: ${res.status} ${res.statusText}`);
          try {
            const errorData = await res.json();
            console.error('Error details:', errorData);
          } catch (e) {
            // If we can't parse JSON, try to get the text
            const errorText = await res.text();
            console.error('Error response:', errorText);
          }
          throw new Error(`Failed to fetch students: ${res.status}`);
        }

        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error('Error in checkAdminAndFetch:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, []);

  if (!isAdmin) return <div className="text-center py-8 text-red-400">Admin access required</div>;
  if (loading) return <div className="text-center py-8">Loading students...</div>;
  if (error) return <div className="text-center py-8 text-red-400">Error: {error}</div>;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-amber-50">
      <h1 className="text-3xl font-bold mb-6">Student List</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Department</th>
              <th className="px-4 py-3 text-left">Marks</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                <td className="px-4 py-3">{student.name}</td>
                <td className="px-4 py-3">{student.department}</td>
                <td className="px-4 py-3">{student.marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsPage;