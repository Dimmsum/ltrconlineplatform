"use client"
import { useState, useEffect } from 'react';
import '../dashboard/dashboard.css';
import './admin.css';
import { auth, db } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const AdminDashboard = () => {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeUsers: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // Fetch user data and check if they're an admin
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.isAdmin) {
              setAdmin({
                uid: authUser.uid,
                email: authUser.email,
                ...userData
              });
              
              // Fetch list of users for admin view
              await fetchUsers();
            } else {
              // Not an admin, redirect to regular dashboard
              router.push('/dashboard');
            }
          } else {
            // User document doesn't exist, redirect to login
            router.push('/login');
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
          router.push('/dashboard');
        }
      } else {
        // No user is signed in, redirect to login
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUsers(usersList);
      setStats({
        totalUsers: usersList.length,
        totalCourses: 4, // Placeholder number
        activeUsers: Math.floor(usersList.length * 0.7) // Placeholder calculation
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header admin-header">
        <div className="header-content">
          <h1>LTRC Admin Dashboard</h1>
          <div className="user-actions">
            <span className="user-greeting">Admin: {admin?.firstName || 'Administrator'}</span>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <nav className="dashboard-nav">
            <ul>
              <li className="nav-item active"><a href="#">Dashboard</a></li>
              <li className="nav-item"><a href="#">User Management</a></li>
              <li className="nav-item"><a href="#">Courses</a></li>
              <li className="nav-item"><a href="#">Resources</a></li>
              <li className="nav-item"><a href="#">System Settings</a></li>
            </ul>
          </nav>
        </aside>

        <main className="main-content">
          <div className="welcome-section admin-welcome">
            <h2>Admin Control Panel</h2>
            <p>Manage users, courses, and system settings from this dashboard.</p>
          </div>

          <div className="stats-overview">
            <div className="stat-card">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalCourses}</h3>
              <p>Active Courses</p>
            </div>
            <div className="stat-card">
              <h3>{stats.activeUsers}</h3>
              <p>Active Users</p>
            </div>
          </div>

          <div className="admin-section">
            <h3>Recent Users</h3>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID Number</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.slice(0, 5).map((user) => (
                      <tr key={user.id}>
                        <td>{user.idNumber || 'N/A'}</td>
                        <td>{`${user.firstName || ''} ${user.lastName || ''}`}</td>
                        <td>{user.email || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn view">View</button>
                            <button className="action-btn edit">Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="view-all-link">
              <a href="#">View All Users</a>
            </div>
          </div>

          <div className="admin-section">
            <h3>System Overview</h3>
            <div className="dashboard-cards admin-cards">
              <div className="dashboard-card">
                <div className="card-icon">👥</div>
                <h3>User Management</h3>
                <p>Add, edit or remove users and manage permissions.</p>
                <a href="#" className="card-link">Manage Users</a>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">📚</div>
                <h3>Course Management</h3>
                <p>Create and manage courses, assign instructors.</p>
                <a href="#" className="card-link">Manage Courses</a>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">📊</div>
                <h3>Analytics</h3>
                <p>View platform usage statistics and reports.</p>
                <a href="#" className="card-link">View Reports</a>
              </div>

              <div className="dashboard-card">
                <div className="card-icon">⚙️</div>
                <h3>System Settings</h3>
                <p>Configure system parameters and settings.</p>
                <a href="#" className="card-link">System Settings</a>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="dashboard-footer">
        <p>&copy; {new Date().getFullYear()} Language Teaching and Research Centre. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;