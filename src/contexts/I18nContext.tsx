import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'vi';

interface I18nState {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nState>({
  language: 'en',
  setLanguage: () => {},
  t: (k) => k,
});

const STORAGE_KEY = 'opal-language';

const en: Record<string, string> = {
  // Global
  cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit',
  close: 'Close', back: 'Back', done: 'Done', apply: 'Apply',
  clear: 'Clear', search: 'Search', add: 'Add', remove: 'Remove',
  yes: 'Yes', no: 'No', on: 'On', off: 'Off',
  active: 'Active', inactive: 'Inactive', all: 'All', none: 'None',
  today: 'Today', tomorrow: 'Tomorrow', min: 'min', mins: 'mins',
  noResults: 'No results', manage: 'Manage', signOut: 'Sign Out',

  // Statuses
  statusConfirmed: 'Confirmed', statusPending: 'Pending',
  statusCheckedIn: 'Checked In', statusInProgress: 'In Progress',
  statusCompleted: 'Completed', statusCancelled: 'Cancelled',
  statusVip: 'VIP', statusRegular: 'Regular', statusNew: 'New',
  statusBusy: 'Busy', statusAvailable: 'Available',

  // Auth
  authWelcome: 'Welcome to Opal',
  authSignIn: 'Sign In',
  authEmail: 'Email',
  authPassword: 'Password',
  authForgotPassword: 'Forgot password?',
  authInvalidCredentials: 'Invalid email or password',
  authSignUp: 'Sign Up',

  // Greeting
  greetMorning: 'Good morning',
  greetAfternoon: 'Good afternoon',
  greetEvening: 'Good evening',

  // Navigation
  navHome: 'Home', navAppts: 'Appts', navTurns: 'Turns', navMore: 'More',

  // Home
  dashTodayRevenue: "Today's Revenue", dashAppointments: 'Appointments',
  dashAvgTicket: 'Avg Ticket', dashUtilization: 'Utilization',
  dashRevenueThisWeek: 'Revenue this week',
  dashTopPerformers: 'Top performers',
  dashBookAppt: 'Book Appointment', dashViewReports: 'View Reports',
  dashBooked: 'Booked today', dashWaiting: 'Waiting',
  dashInService: 'In service', dashReadyCheckout: 'Ready for checkout',
  dashUpNext: 'Up next', dashWaitingQueue: 'Waiting',
  dashMySchedule: 'My schedule', dashTurnPosition: 'Turn position',
  dashEarnings: 'Earnings', dashNextUp: 'Next up',

  // Appointments
  apptUpcoming: 'Upcoming', apptPast: 'Past',
  apptMorning: 'Morning', apptAfternoon: 'Afternoon', apptEvening: 'Evening',
  apptNoAppointments: 'No appointments',
  apptDetail: 'Appointment', apptDate: 'Date', apptTime: 'Time',
  apptDuration: 'Duration', apptType: 'Type', apptStatus: 'Status',
  apptServices: 'Services', apptNotes: 'Notes', apptTicket: 'Ticket',
  apptTotal: 'Total',

  // Booking
  bkTitle: 'Book Appointment', bkClient: 'Client',
  bkServices: 'Services', bkTechnician: 'Technician',
  bkDateTime: 'Date & Time', bkNotes: 'Notes',
  bkConfirm: 'Confirm Booking', bkSearchClients: 'Search clients...',
  bkNewClient: 'New Client', bkAnyAvailable: 'Any Available',
  bkChosenTech: 'Chosen Tech', bkAnyTech: 'Any Tech',
  bkNewCustomer: 'New Customer', bkOnline: 'Online',
  bkBlockTime: 'Block Time', bkBlockTimeOff: 'Block Time Off',
  bkReason: 'Reason', bkFullDay: 'Full Day',

  // Turns
  turnQueue: 'Turn Queue', turnServing: 'Serving',
  turnBreak: 'Break', turnNotIn: 'Not In',
  turnNoUpcoming: 'No upcoming turns', turnStation: 'Station',

  // More
  moreProfile: 'Profile', moreReports: 'Reports',
  morePayroll: 'Payroll', moreMyEarnings: 'My Earnings',
  moreClients: 'Clients', moreServices: 'Services',
  moreProducts: 'Products', moreStaff: 'Staff', moreRoles: 'Roles',
  moreBusinessInfo: 'Business Info', moreBusinessHours: 'Business Hours',
  moreNotifications: 'Notifications', moreAppearance: 'Appearance',
  moreLanguage: 'Language',
  moreBusiness: 'BUSINESS', moreManage: 'MANAGE', morePreferences: 'PREFERENCES',

  // Reports
  rpRevenue: 'Revenue', rpAppointments: 'Appointments',
  rpAvgTicket: 'Avg Ticket', rpUtilization: 'Utilization',
  rpServiceMix: 'Service mix', rpTechLeaderboard: 'Technician leaderboard',
  rpHourlyBreakdown: 'Hourly breakdown',
  rpThisWeek: 'This week', rpThisMonth: 'This month',
  rpThisQuarter: 'This quarter', rpCustom: 'Custom',

  // Payroll
  pyTitle: 'Payroll', pyPeriodSummary: 'Period summary',
  pyTotalPayout: 'Total payout', pyServiceSales: 'Service sales',
  pyTotalTips: 'Total tips', pyDeductions: 'Deductions',
  pyHours: 'Hours', pyCommission: 'Commission', pyTips: 'Tips',
  pyTotalPayoutLabel: 'Total Payout',

  // Earnings
  earnTitle: 'My Earnings', earnTotalEarnings: 'Total Earnings',
  earnHoursWorked: 'Hours worked', earnApptsCompleted: 'Appointments completed',
  earnAvgTicket: 'Avg ticket', earnDailyBreakdown: 'Daily breakdown',

  // Profile
  profileTitle: 'Profile', profileFirstName: 'First name',
  profileLastName: 'Last name', profileEmail: 'Email',
  profilePhone: 'Phone', profileRole: 'Role',
  profileBiometric: 'Biometric unlock',
  profileSchedule: 'Schedule', profileServicesOffered: 'Services offered',
  profileCompensation: 'Compensation',

  // Manage entities
  clTitle: 'Clients', clPhone: 'Phone', clVisits: 'Visits',
  clLastVisit: 'Last visit', clSpend: 'Total spend', clNotes: 'Notes',
  clPreferredTech: 'Preferred tech',

  svTitle: 'Services', svCategory: 'Category', svDuration: 'Duration',
  svPrice: 'Price', svDescription: 'Description',

  prTitle: 'Products', prCategory: 'Category', prPrice: 'Price',
  prSku: 'SKU', prStock: 'Stock', prDescription: 'Description',

  tkTitle: 'Staff', tkPhone: 'Phone', tkEmail: 'Email',
  tkRole: 'Role', tkShift: 'Shift', tkDays: 'Days',
  tkRating: 'Rating', tkClients: 'Clients', tkBio: 'Bio',

  rlTitle: 'Roles', rlName: 'Name', rlDescription: 'Description',

  // Business
  bizName: 'Salon name', bizAddress: 'Address', bizPhone: 'Phone',
  bizEmail: 'Email', bizTaxRate: 'Tax rate',

  // Hours
  hoursTitle: 'Business Hours', hoursClosed: 'Closed',
  hoursOpen: 'Open', hoursClose: 'Close',

  // Notifications
  notifTitle: 'Notifications', notifAppointments: 'Appointments',
  notifNewBooking: 'New booking', notifCancellation: 'Cancellation',
  notifReschedule: 'Reschedule', notifCheckedIn: 'Client checked in',
  notifReminder: 'Reminder (1 hr before)',
  notifServices: 'Services', notifServiceStarted: 'Service started',
  notifServiceCompleted: 'Service completed',
  notifReadyCheckout: 'Ready for checkout',
  notifTurns: 'Turns', notifYourTurn: 'Your turn is coming up',
  notifQueueChanged: 'Queue position changed',
  notifDaily: 'Daily', notifMorningRecap: 'Morning recap',
  notifEndOfDay: 'End of day summary',
  notifMarkAllRead: 'Mark all read',

  // Appearance
  appearLight: 'Light', appearDark: 'Dark',

  // Language
  langEnglish: 'English', langVietnamese: 'Tiếng Việt',

  // Store
  storeAllStores: 'All Stores', storeSelectStore: 'Select a store',

  // Days
  dayMon: 'Mon', dayTue: 'Tue', dayWed: 'Wed', dayThu: 'Thu',
  dayFri: 'Fri', daySat: 'Sat', daySun: 'Sun',
  dayMonFull: 'Monday', dayTueFull: 'Tuesday', dayWedFull: 'Wednesday',
  dayThuFull: 'Thursday', dayFriFull: 'Friday', daySatFull: 'Saturday',
  daySunFull: 'Sunday',

  // Filters
  filterAll: 'All', filterVip: 'VIP', filterRegular: 'Regular',
  filterNew: 'New', filterActive: 'Active', filterInactive: 'Inactive',
  filterManicure: 'Manicure', filterPedicure: 'Pedicure',
  filterCombo: 'Combo', filterAddOn: 'Add-on',
};

const vi: Record<string, string> = {
  cancel: 'Huỷ', save: 'Lưu', delete: 'Xoá', edit: 'Sửa',
  close: 'Đóng', back: 'Quay lại', done: 'Xong', apply: 'Áp dụng',
  clear: 'Xoá', search: 'Tìm kiếm', add: 'Thêm', remove: 'Xoá',
  yes: 'Có', no: 'Không', on: 'Bật', off: 'Tắt',
  active: 'Hoạt động', inactive: 'Không hoạt động', all: 'Tất cả', none: 'Không',
  today: 'Hôm nay', tomorrow: 'Ngày mai', min: 'phút', mins: 'phút',
  noResults: 'Không có kết quả', manage: 'Quản lý', signOut: 'Đăng xuất',

  statusConfirmed: 'Đã xác nhận', statusPending: 'Đang chờ',
  statusCheckedIn: 'Đã đến', statusInProgress: 'Đang làm',
  statusCompleted: 'Hoàn thành', statusCancelled: 'Đã huỷ',
  statusVip: 'VIP', statusRegular: 'Thường', statusNew: 'Mới',

  authWelcome: 'Chào mừng đến Opal',
  authSignIn: 'Đăng nhập', authEmail: 'Email', authPassword: 'Mật khẩu',
  authForgotPassword: 'Quên mật khẩu?',
  authInvalidCredentials: 'Email hoặc mật khẩu không hợp lệ',

  greetMorning: 'Chào buổi sáng',
  greetAfternoon: 'Chào buổi chiều',
  greetEvening: 'Chào buổi tối',

  navHome: 'Trang chủ', navAppts: 'Lịch hẹn', navTurns: 'Lượt', navMore: 'Thêm',

  dashTodayRevenue: 'Doanh thu hôm nay', dashAppointments: 'Lịch hẹn',
  dashAvgTicket: 'TB/Lượt', dashUtilization: 'Hiệu suất',
  dashBookAppt: 'Đặt lịch', dashViewReports: 'Xem báo cáo',
  dashBooked: 'Đã đặt', dashWaiting: 'Đang chờ',
  dashInService: 'Đang phục vụ', dashReadyCheckout: 'Sẵn sàng thanh toán',
  dashUpNext: 'Tiếp theo', dashMySchedule: 'Lịch của tôi',

  apptUpcoming: 'Sắp tới', apptPast: 'Đã qua',
  apptNoAppointments: 'Không có lịch hẹn',
  apptDetail: 'Lịch hẹn', apptServices: 'Dịch vụ',

  bkTitle: 'Đặt lịch', bkClient: 'Khách hàng',
  bkServices: 'Dịch vụ', bkTechnician: 'Kỹ thuật viên',
  bkConfirm: 'Xác nhận đặt lịch',

  turnQueue: 'Hàng đợi lượt',

  moreProfile: 'Hồ sơ', moreReports: 'Báo cáo',
  morePayroll: 'Bảng lương', moreMyEarnings: 'Thu nhập',
  moreClients: 'Khách hàng', moreServices: 'Dịch vụ',
  moreProducts: 'Sản phẩm', moreStaff: 'Nhân viên', moreRoles: 'Vai trò',
  moreBusinessInfo: 'Thông tin salon', moreBusinessHours: 'Giờ hoạt động',
  moreNotifications: 'Thông báo', moreAppearance: 'Giao diện',
  moreLanguage: 'Ngôn ngữ',
  moreBusiness: 'KINH DOANH', moreManage: 'QUẢN LÝ', morePreferences: 'TÙY CHỌN',

  storeAllStores: 'Tất cả cửa hàng',
  notifTitle: 'Thông báo', notifMarkAllRead: 'Đánh dấu đã đọc',
  appearLight: 'Sáng', appearDark: 'Tối',
  langEnglish: 'English', langVietnamese: 'Tiếng Việt',
};

const translations: Record<Language, Record<string, string>> = { en, vi };

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'vi') setLanguageState('vi');
    });
  }, []);

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    AsyncStorage.setItem(STORAGE_KEY, l);
  };

  const t = useCallback(
    (key: string, vars?: Record<string, string>): string => {
      let str = translations[language][key] ?? translations.en[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(`{${k}}`, v);
        });
      }
      return str;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslation = () => useContext(I18nContext);
