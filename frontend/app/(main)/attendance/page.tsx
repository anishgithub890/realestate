'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AttendancePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  // Fetch today's attendance
  const { data: todayAttendance } = useQuery<any>({
    queryKey: ['attendance-today', user?.id],
    queryFn: () => api.get('/attendance/today'),
    enabled: !!user?.id,
  });

  // Fetch attendance history
  const { data: attendanceHistory } = useQuery<any>({
    queryKey: ['attendance-history', selectedDate],
    queryFn: () => api.get('/attendance', { date: selectedDate }),
    enabled: !!selectedDate,
  });

  // Fetch user activities
  const { data: activitiesData } = useQuery<any>({
    queryKey: ['user-activities', selectedDate],
    queryFn: () => api.get('/attendance/activities', { date: selectedDate }),
    enabled: !!selectedDate,
  });

  const checkInMutation = useMutation({
    mutationFn: (location?: { latitude: number; longitude: number }) =>
      api.post('/attendance/check-in', location),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Checked in successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to check in',
        variant: 'destructive',
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (location?: { latitude: number; longitude: number }) =>
      api.post('/attendance/check-out', location),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Checked out successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to check out',
        variant: 'destructive',
      });
    },
  });

  const handleCheckIn = () => {
    // Try to get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          checkInMutation.mutate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          // If location denied, check in without location
          checkInMutation.mutate(undefined);
        }
      );
    } else {
      checkInMutation.mutate(undefined);
    }
  };

  const handleCheckOut = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          checkOutMutation.mutate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          checkOutMutation.mutate(undefined);
        }
      );
    } else {
      checkOutMutation.mutate(undefined);
    }
  };

  const attendance = todayAttendance?.data;
  const history = attendanceHistory?.data || [];
  const activities = activitiesData?.data || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-2">Track your attendance and activities</p>
        </div>
        <div className="flex items-center gap-2">
          {attendance && !attendance.check_in_time && (
            <Button onClick={handleCheckIn} disabled={checkInMutation.isPending}>
              <Clock className="w-4 h-4 mr-2" />
              Check In
            </Button>
          )}
          {attendance && attendance.check_in_time && !attendance.check_out_time && (
            <Button onClick={handleCheckOut} disabled={checkOutMutation.isPending}>
              <Clock className="w-4 h-4 mr-2" />
              Check Out
            </Button>
          )}
        </div>
      </div>

      {/* Today's Attendance Card */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>{format(new Date(), 'EEEE, MMMM dd, yyyy')}</CardDescription>
        </CardHeader>
        <CardContent>
          {attendance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Check In</div>
                  <div className="text-lg font-semibold">
                    {attendance.check_in_time
                      ? format(new Date(attendance.check_in_time), 'h:mm a')
                      : 'Not checked in'}
                  </div>
                  {attendance.check_in_latitude && attendance.check_in_longitude && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {attendance.check_in_latitude.toFixed(6)}, {attendance.check_in_longitude.toFixed(6)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Check Out</div>
                  <div className="text-lg font-semibold">
                    {attendance.check_out_time
                      ? format(new Date(attendance.check_out_time), 'h:mm a')
                      : 'Not checked out'}
                  </div>
                  {attendance.check_out_latitude && attendance.check_out_longitude && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {attendance.check_out_latitude.toFixed(6)}, {attendance.check_out_longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Badge
                  variant={attendance.status === 'present' ? 'default' : 'secondary'}
                  className={
                    attendance.status === 'present'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {attendance.status}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No attendance record for today
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {record.check_in_time
                          ? format(new Date(record.check_in_time), 'h:mm a')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {record.check_out_time
                          ? format(new Date(record.check_out_time), 'h:mm a')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* User Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Activities</CardTitle>
            <CardDescription>Track your daily activities</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activities recorded today
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity: any) => (
                  <div key={activity.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{activity.activity_type}</span>
                      {activity.duration_minutes && (
                        <Badge variant="outline">
                          {activity.duration_minutes} min
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

