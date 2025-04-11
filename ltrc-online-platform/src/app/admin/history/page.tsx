"use client"
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, DocumentData, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import '../admin.css';

// Define TypeScript interfaces for your data
interface HelpRequest {
  id: string;
  IDNumber?: string;
  Name?: string;
  Request?: string;
  Date?: string;
  Time?: string;
  AdditionalInformation?: string;
  userEmail?: string;
  createdAt?: Timestamp | Date | string | number | null;
  [key: string]: string | number | boolean | Timestamp | Date | null | undefined;
}

const AdminHistory = () => {
  const [pastRequests, setPastRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPastRequests = async () => {
      try {
        setLoading(true);
        const helpRequestsRef = collection(db, 'meetings');
        
        // Get the date from 2 weeks ago
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        // Query for all meetings that happened more than 2 weeks ago
        const q = query(
          helpRequestsRef,
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        const requests: HelpRequest[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          // Filter for older requests in the client
          // This is a simpler approach than using a "where" clause with Timestamps
          if (data.createdAt && data.createdAt instanceof Timestamp) {
            const date = data.createdAt.toDate();
            if (date < twoWeeksAgo) {
              requests.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt
              } as HelpRequest);
            }
          }
        });
        
        setPastRequests(requests);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching past requests: ", err);
        setError("Failed to load past requests. Please try again later.");
        setLoading(false);
      }
    };

    fetchPastRequests();
  }, []);

  const formatDateTime = (timestamp?: Timestamp | Date | string | number | null): string => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firestore Timestamp objects
      let date: Date;
      
      if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (err) {
      console.error("Error formatting date:", err);
      return String(timestamp);
    }
  };

  return (
    <div className="history-container">
      <h2>Request History</h2>

      {loading ? (
        <div className="loading">Loading past requests...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="request-list">
          {pastRequests.length === 0 ? (
            <div className="no-requests">No past requests found</div>
          ) : (
            pastRequests.map(item => (
              <div key={item.id} className="request-container">
                <div className="request-detail">
                  <span className="label">ID Number:</span>
                  <span className="value">{item.IDNumber || 'N/A'}</span>
                </div>
                <div className="request-detail">
                  <span className="label">Name:</span>
                  <span className="value">{item.Name || 'N/A'}</span>
                </div>
                <div className="request-detail">
                  <span className="label">Reason for help:</span>
                  <span className="value">{item.Request || 'N/A'}</span>
                </div>
                <div className="request-detail">
                  <span className="label">Date and Time:</span>
                  <span className="value">{formatDateTime(item.createdAt)}</span>
                </div>
                {item.AdditionalInformation && (
                  <div className="request-detail">
                    <span className="label">Additional Information:</span>
                    <span className="value">{item.AdditionalInformation}</span>
                  </div>
                )}
                {item.userEmail && (
                  <div className="request-detail">
                    <span className="label">Email:</span>
                    <span className="value">{item.userEmail}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminHistory;