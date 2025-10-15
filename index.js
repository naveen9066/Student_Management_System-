// Student Management System - Main JavaScript File
class StudentManagementSystem {
    constructor() {
        this.students = this.loadStudents();
        this.attendance = this.loadAttendance();
        this.currentSection = 'dashboard';
        this.editingStudentId = null;
        
        this.init();
    }

    init() {
        this.hideLoadingScreen();
        this.setupEventListeners();
        this.renderDashboard();
        this.renderStudents();
        this.renderAttendance();
        this.updateStats();
        this.setupThemeToggle();
        this.setupKeyboardNavigation();
    }

    // Loading Screen Management
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1500);
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
                this.updateNavigation(link);
            });
        });

        // Modal Controls
        this.setupModalControls();
        
        // Form Submissions
        document.getElementById('student-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStudentFormSubmit();
        });

        // Search and Filter
        document.getElementById('student-search').addEventListener('input', (e) => {
            this.filterStudents(e.target.value);
        });

        document.getElementById('grade-filter').addEventListener('change', (e) => {
            this.filterStudents(document.getElementById('student-search').value, e.target.value);
        });

        // Attendance Controls
        document.getElementById('attendance-date').addEventListener('change', (e) => {
            this.renderAttendance(e.target.value);
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchAttendanceView(e.target.dataset.view);
            });
        });

        document.getElementById('mark-all-present').addEventListener('click', () => {
            this.markAllPresent();
        });

        // Quick Actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.target.dataset.action);
            });
        });

        // Add Student Buttons
        document.getElementById('add-student-btn').addEventListener('click', () => {
            this.showStudentModal();
        });

        document.getElementById('add-student-modal-btn').addEventListener('click', () => {
            this.showStudentModal();
        });

        // Export Functionality
        document.getElementById('export-report').addEventListener('click', () => {
            this.exportReport();
        });
    }

    setupModalControls() {
        // Student Modal
        const studentModal = document.getElementById('student-modal');
        const studentModalClose = studentModal.querySelectorAll('.modal-close');
        
        studentModalClose.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideStudentModal();
            });
        });

        studentModal.addEventListener('click', (e) => {
            if (e.target === studentModal) {
                this.hideStudentModal();
            }
        });

        // Attendance Modal
        const attendanceModal = document.getElementById('attendance-modal');
        const attendanceModalClose = attendanceModal.querySelectorAll('.modal-close');
        
        attendanceModalClose.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAttendanceModal();
            });
        });

        attendanceModal.addEventListener('click', (e) => {
            if (e.target === attendanceModal) {
                this.hideAttendanceModal();
            }
        });

        // Modal Attendance Controls
        document.getElementById('mark-all-present-modal').addEventListener('click', () => {
            this.markAllPresentModal();
        });

        document.getElementById('mark-all-absent-modal').addEventListener('click', () => {
            this.markAllAbsentModal();
        });

        document.getElementById('modal-attendance-date').addEventListener('change', (e) => {
            this.renderModalAttendance(e.target.value);
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const currentTheme = localStorage.getItem('theme') || 'dark';
        
        document.documentElement.setAttribute('data-theme', currentTheme);
        this.updateThemeIcon(currentTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeIcon(newTheme);
        });
    }

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals
            if (e.key === 'Escape') {
                this.hideStudentModal();
                this.hideAttendanceModal();
            }

            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('student-search').focus();
            }

            // Ctrl/Cmd + N for new student
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.showStudentModal();
            }
        });
    }

    // Navigation Management
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Refresh section content
            switch(sectionName) {
                case 'dashboard':
                    this.renderDashboard();
                    this.updateStats();
                    break;
                case 'students':
                    this.renderStudents();
                    break;
                case 'attendance':
                    this.renderAttendance();
                    break;
                case 'reports':
                    this.renderReports();
                    break;
            }
        }
    }

    updateNavigation(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // Data Management
    loadStudents() {
        const saved = localStorage.getItem('students');
        return saved ? JSON.parse(saved) : [];
    }

    saveStudents() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }

    loadAttendance() {
        const saved = localStorage.getItem('attendance');
        return saved ? JSON.parse(saved) : {};
    }

    saveAttendance() {
        localStorage.setItem('attendance', JSON.stringify(this.attendance));
    }

    generateStudentId() {
        return 'STU_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Student Management
    addStudent(studentData) {
        const student = {
            id: this.generateStudentId(),
            ...studentData,
            createdAt: new Date().toISOString(),
            attendance: []
        };
        
        this.students.push(student);
        this.saveStudents();
        this.renderStudents();
        this.updateStats();
        this.showNotification('success', 'Student Added', `${student.firstName} ${student.lastName} has been added successfully.`);
        return student;
    }

    updateStudent(studentId, studentData) {
        const index = this.students.findIndex(s => s.id === studentId);
        if (index !== -1) {
            this.students[index] = { ...this.students[index], ...studentData };
            this.saveStudents();
            this.renderStudents();
            this.updateStats();
            this.showNotification('success', 'Student Updated', 'Student information has been updated successfully.');
            return this.students[index];
        }
        return null;
    }

    deleteStudent(studentId) {
        const index = this.students.findIndex(s => s.id === studentId);
        if (index !== -1) {
            const student = this.students[index];
            this.students.splice(index, 1);
            this.saveStudents();
            this.renderStudents();
            this.updateStats();
            this.showNotification('info', 'Student Deleted', `${student.firstName} ${student.lastName} has been removed.`);
            return true;
        }
        return false;
    }

    getStudent(studentId) {
        return this.students.find(s => s.id === studentId);
    }

    // Attendance Management
    markAttendance(studentId, date, status) {
        if (!this.attendance[date]) {
            this.attendance[date] = {};
        }
        
        this.attendance[date][studentId] = {
            status: status,
            timestamp: new Date().toISOString()
        };
        
        this.saveAttendance();
        this.renderAttendance(date);
        this.updateStats();
    }

    getAttendanceForDate(date) {
        return this.attendance[date] || {};
    }

    getStudentAttendance(studentId, period = 'month') {
        const now = new Date();
        const startDate = new Date();
        
        switch(period) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'semester':
                startDate.setMonth(now.getMonth() - 6);
                break;
        }
        
        const attendance = [];
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            if (this.attendance[dateStr] && this.attendance[dateStr][studentId]) {
                attendance.push({
                    date: dateStr,
                    status: this.attendance[dateStr][studentId].status
                });
            }
        }
        
        return attendance;
    }

    calculateAttendancePercentage(studentId, period = 'month') {
        const attendance = this.getStudentAttendance(studentId, period);
        if (attendance.length === 0) return 0;
        
        const presentDays = attendance.filter(a => a.status === 'present').length;
        return Math.round((presentDays / attendance.length) * 100);
    }

    // UI Rendering
    renderDashboard() {
        this.updateStats();
        this.renderRecentActivity();
    }

    updateStats() {
        const totalStudents = this.students.length;
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = this.getAttendanceForDate(today);
        const presentToday = Object.values(todayAttendance).filter(a => a.status === 'present').length;
        const attendanceToday = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;
        
        // Calculate average attendance
        let totalAttendancePercentage = 0;
        this.students.forEach(student => {
            totalAttendancePercentage += this.calculateAttendancePercentage(student.id);
        });
        const avgAttendance = totalStudents > 0 ? Math.round(totalAttendancePercentage / totalStudents) : 0;
        
        // Count low attendance students (< 80%)
        const lowAttendance = this.students.filter(student => 
            this.calculateAttendancePercentage(student.id) < 80
        ).length;

        document.getElementById('total-students').textContent = totalStudents;
        document.getElementById('attendance-today').textContent = attendanceToday + '%';
        document.getElementById('avg-attendance').textContent = avgAttendance + '%';
        document.getElementById('low-attendance').textContent = lowAttendance;
    }

    renderRecentActivity() {
        const activityList = document.getElementById('recent-activity-list');
        const recentActivities = this.getRecentActivities();
        
        if (recentActivities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-info-circle"></i>
                    <span>No recent activity</span>
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <i class="${activity.icon}"></i>
                <span>${activity.message}</span>
                <small>${activity.time}</small>
            </div>
        `).join('');
    }

    getRecentActivities() {
        // This would typically come from a more sophisticated activity log
        // For now, we'll generate some sample activities based on recent actions
        const activities = [];
        
        // Add recent student additions
        const recentStudents = this.students
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
            
        recentStudents.forEach(student => {
            const timeAgo = this.getTimeAgo(new Date(student.createdAt));
            activities.push({
                icon: 'fas fa-user-plus',
                message: `${student.firstName} ${student.lastName} was added`,
                time: timeAgo
            });
        });
        
        return activities;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    renderStudents(searchTerm = '', gradeFilter = '') {
        const studentsGrid = document.getElementById('students-grid');
        let filteredStudents = this.students;
        
        // Apply filters
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredStudents = filteredStudents.filter(student => 
                student.firstName.toLowerCase().includes(term) ||
                student.lastName.toLowerCase().includes(term) ||
                student.email.toLowerCase().includes(term)
            );
        }
        
        if (gradeFilter) {
            filteredStudents = filteredStudents.filter(student => 
                student.grade === gradeFilter
            );
        }
        
        if (filteredStudents.length === 0) {
            studentsGrid.innerHTML = `
                <div class="no-students">
                    <i class="fas fa-users"></i>
                    <h3>No students found</h3>
                    <p>Try adjusting your search criteria or add a new student.</p>
                    <button class="btn btn-primary" onclick="sms.showStudentModal()">
                        <i class="fas fa-plus"></i>
                        Add Student
                    </button>
                </div>
            `;
            return;
        }
        
        studentsGrid.innerHTML = filteredStudents.map(student => this.createStudentCard(student)).join('');
    }

    createStudentCard(student) {
        const attendancePercentage = this.calculateAttendancePercentage(student.id);
        const attendanceColor = attendancePercentage >= 90 ? 'var(--neon-green)' : 
                               attendancePercentage >= 70 ? 'var(--neon-orange)' : 'var(--neon-pink)';
        
        return `
            <div class="student-card fade-in" data-student-id="${student.id}">
                <div class="student-header">
                    <div class="student-avatar">
                        ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                    </div>
                    <div class="student-info">
                        <h3>${student.firstName} ${student.lastName}</h3>
                        <p>Grade ${student.grade}</p>
                    </div>
                </div>
                
                <div class="student-details">
                    <div class="student-detail">
                        <span class="label">Email:</span>
                        <span class="value">${student.email}</span>
                    </div>
                    <div class="student-detail">
                        <span class="label">Phone:</span>
                        <span class="value">${student.phone || 'N/A'}</span>
                    </div>
                    <div class="student-detail">
                        <span class="label">Attendance:</span>
                        <span class="value" style="color: ${attendanceColor}">${attendancePercentage}%</span>
                    </div>
                </div>
                
                <div class="student-actions">
                    <button class="btn btn-secondary" onclick="sms.editStudent('${student.id}')">
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="btn btn-primary" onclick="sms.showStudentProfile('${student.id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-danger" onclick="sms.deleteStudent('${student.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    renderAttendance(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const attendanceList = document.getElementById('attendance-list');
        const dateInput = document.getElementById('attendance-date');
        
        if (dateInput) {
            dateInput.value = targetDate;
        }
        
        if (this.students.length === 0) {
            attendanceList.innerHTML = `
                <div class="no-attendance">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No students to mark attendance</h3>
                    <p>Add some students first to manage attendance.</p>
                </div>
            `;
            return;
        }
        
        const attendanceForDate = this.getAttendanceForDate(targetDate);
        let presentCount = 0, absentCount = 0, lateCount = 0;
        
        attendanceList.innerHTML = this.students.map(student => {
            const attendance = attendanceForDate[student.id];
            const status = attendance ? attendance.status : null;
            
            if (status === 'present') presentCount++;
            else if (status === 'absent') absentCount++;
            else if (status === 'late') lateCount++;
            
            return this.createAttendanceItem(student, targetDate, status);
        }).join('');
        
        // Update summary
        document.getElementById('present-count').textContent = presentCount;
        document.getElementById('absent-count').textContent = absentCount;
        document.getElementById('late-count').textContent = lateCount;
    }

    createAttendanceItem(student, date, currentStatus) {
        return `
            <div class="attendance-item" data-student-id="${student.id}">
                <div class="attendance-avatar">
                    ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                </div>
                <div class="attendance-info">
                    <h4>${student.firstName} ${student.lastName}</h4>
                    <p>Grade ${student.grade} • ${student.email}</p>
                </div>
                <div class="attendance-status">
                    <button class="status-btn present ${currentStatus === 'present' ? 'active' : ''}" 
                            onclick="sms.markAttendance('${student.id}', '${date}', 'present')">
                        <i class="fas fa-check"></i>
                        Present
                    </button>
                    <button class="status-btn absent ${currentStatus === 'absent' ? 'active' : ''}" 
                            onclick="sms.markAttendance('${student.id}', '${date}', 'absent')">
                        <i class="fas fa-times"></i>
                        Absent
                    </button>
                    <button class="status-btn late ${currentStatus === 'late' ? 'active' : ''}" 
                            onclick="sms.markAttendance('${student.id}', '${date}', 'late')">
                        <i class="fas fa-clock"></i>
                        Late
                    </button>
                </div>
            </div>
        `;
    }

    renderModalAttendance(date) {
        const modalAttendanceList = document.getElementById('modal-attendance-list');
        const attendanceForDate = this.getAttendanceForDate(date);
        
        modalAttendanceList.innerHTML = this.students.map(student => {
            const attendance = attendanceForDate[student.id];
            const status = attendance ? attendance.status : null;
            
            return this.createModalAttendanceItem(student, date, status);
        }).join('');
    }

    createModalAttendanceItem(student, date, currentStatus) {
        return `
            <div class="attendance-item" data-student-id="${student.id}">
                <div class="attendance-avatar">
                    ${student.firstName.charAt(0)}${student.lastName.charAt(0)}
                </div>
                <div class="attendance-info">
                    <h4>${student.firstName} ${student.lastName}</h4>
                    <p>Grade ${student.grade}</p>
                </div>
                <div class="attendance-status">
                    <button class="status-btn present ${currentStatus === 'present' ? 'active' : ''}" 
                            onclick="sms.markAttendance('${student.id}', '${date}', 'present')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="status-btn absent ${currentStatus === 'absent' ? 'active' : ''}" 
                            onclick="sms.markAttendance('${student.id}', '${date}', 'absent')">
                        <i class="fas fa-times"></i>
                    </button>
                    <button class="status-btn late ${currentStatus === 'late' ? 'active' : ''}" 
                            onclick="sms.markAttendance('${student.id}', '${date}', 'late')">
                        <i class="fas fa-clock"></i>
                    </button>
                </div>
            </div>
        `;
    }

    renderReports() {
        // This would render comprehensive reports
        // For now, we'll show a placeholder
        const reportsList = document.getElementById('detailed-reports-list');
        reportsList.innerHTML = `
            <div class="report-item">
                <div class="report-info">
                    <h4>Monthly Attendance Report</h4>
                    <p>Complete attendance overview for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div class="report-actions">
                    <button class="btn btn-primary" onclick="sms.exportReport()">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                </div>
            </div>
        `;
    }

    // Modal Management
    showStudentModal(studentId = null) {
        const modal = document.getElementById('student-modal');
        const form = document.getElementById('student-form');
        const title = document.getElementById('modal-title');
        
        if (studentId) {
            // Edit mode
            const student = this.getStudent(studentId);
            if (student) {
                this.editingStudentId = studentId;
                title.textContent = 'Edit Student';
                this.populateStudentForm(student);
            }
        } else {
            // Add mode
            this.editingStudentId = null;
            title.textContent = 'Add New Student';
            form.reset();
            this.clearFormErrors();
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideStudentModal() {
        const modal = document.getElementById('student-modal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Reset form
        const form = document.getElementById('student-form');
        form.reset();
        this.clearFormErrors();
        this.editingStudentId = null;
    }

    showAttendanceModal() {
        const modal = document.getElementById('attendance-modal');
        const dateInput = document.getElementById('modal-attendance-date');
        
        dateInput.value = new Date().toISOString().split('T')[0];
        this.renderModalAttendance(dateInput.value);
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hideAttendanceModal() {
        const modal = document.getElementById('attendance-modal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Form Handling
    populateStudentForm(student) {
        const form = document.getElementById('student-form');
        Object.keys(student).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = student[key];
            }
        });
    }

    handleStudentFormSubmit() {
        const form = document.getElementById('student-form');
        const formData = new FormData(form);
        const studentData = Object.fromEntries(formData.entries());
        
        // Validate form
        if (!this.validateStudentForm(studentData)) {
            return;
        }
        
        if (this.editingStudentId) {
            // Update existing student
            this.updateStudent(this.editingStudentId, studentData);
        } else {
            // Add new student
            this.addStudent(studentData);
        }
        
        this.hideStudentModal();
    }

    validateStudentForm(data) {
        let isValid = true;
        this.clearFormErrors();
        
        // Required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'grade'];
        requiredFields.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                this.showFieldError(field, `${this.formatFieldName(field)} is required`);
                isValid = false;
            }
        });
        
        // Email validation
        if (data.email && !this.isValidEmail(data.email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Check for duplicate email
        if (data.email && !this.editingStudentId) {
            const existingStudent = this.students.find(s => s.email === data.email);
            if (existingStudent) {
                this.showFieldError('email', 'A student with this email already exists');
                isValid = false;
            }
        }
        
        return isValid;
    }

    showFieldError(fieldName, message) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.classList.add('error');
            const errorDiv = field.parentNode.querySelector('.error-message');
            if (errorDiv) {
                errorDiv.textContent = message;
            }
        }
    }

    clearFormErrors() {
        document.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
        });
        document.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
    }

    formatFieldName(fieldName) {
        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Student Actions
    editStudent(studentId) {
        this.showStudentModal(studentId);
    }

    deleteStudent(studentId) {
        const student = this.getStudent(studentId);
        if (student && confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
            this.deleteStudent(studentId);
        }
    }

    showStudentProfile(studentId) {
        const student = this.getStudent(studentId);
        if (student) {
            // This would show a detailed student profile modal
            // For now, we'll just show an alert
            alert(`Student Profile: ${student.firstName} ${student.lastName}\nEmail: ${student.email}\nGrade: ${student.grade}\nAttendance: ${this.calculateAttendancePercentage(studentId)}%`);
        }
    }

    // Attendance Actions
    markAllPresent() {
        const date = document.getElementById('attendance-date').value;
        this.students.forEach(student => {
            this.markAttendance(student.id, date, 'present');
        });
        this.renderAttendance(date);
    }

    markAllPresentModal() {
        const date = document.getElementById('modal-attendance-date').value;
        this.students.forEach(student => {
            this.markAttendance(student.id, date, 'present');
        });
        this.renderModalAttendance(date);
    }

    markAllAbsentModal() {
        const date = document.getElementById('modal-attendance-date').value;
        this.students.forEach(student => {
            this.markAttendance(student.id, date, 'absent');
        });
        this.renderModalAttendance(date);
    }

    switchAttendanceView(view) {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Update attendance display based on view
        this.renderAttendance();
    }

    // Search and Filter
    filterStudents(searchTerm, gradeFilter) {
        this.renderStudents(searchTerm, gradeFilter);
    }

    // Quick Actions
    handleQuickAction(action) {
        switch(action) {
            case 'add-student':
                this.showStudentModal();
                break;
            case 'mark-attendance':
                this.showAttendanceModal();
                break;
            case 'view-reports':
                this.showSection('reports');
                break;
            case 'export-data':
                this.exportReport();
                break;
        }
    }

    // Export Functionality
    exportReport() {
        const reportData = {
            students: this.students,
            attendance: this.attendance,
            generatedAt: new Date().toISOString(),
            stats: {
                totalStudents: this.students.length,
                averageAttendance: this.calculateAverageAttendance()
            }
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `student-report-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('success', 'Report Exported', 'Student data has been exported successfully.');
    }

    calculateAverageAttendance() {
        if (this.students.length === 0) return 0;
        
        let totalPercentage = 0;
        this.students.forEach(student => {
            totalPercentage += this.calculateAttendancePercentage(student.id);
        });
        
        return Math.round(totalPercentage / this.students.length);
    }

    // Notification System
    showNotification(type, title, message) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icons[type]}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }
}

// Initialize the application
let sms;
document.addEventListener('DOMContentLoaded', () => {
    sms = new StudentManagementSystem();
});

// Add some sample data for demonstration
function addSampleData() {
    if (sms.students.length === 0) {
        const sampleStudents = [
            {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                phone: '+1-555-0123',
                grade: '5',
                dateOfBirth: '2010-03-15',
                address: '123 Main St, Anytown, USA',
                parentName: 'Jane Doe',
                parentPhone: '+1-555-0124'
            },
            {
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice.smith@example.com',
                phone: '+1-555-0125',
                grade: '4',
                dateOfBirth: '2011-07-22',
                address: '456 Oak Ave, Anytown, USA',
                parentName: 'Bob Smith',
                parentPhone: '+1-555-0126'
            },
            {
                firstName: 'Michael',
                lastName: 'Johnson',
                email: 'michael.johnson@example.com',
                phone: '+1-555-0127',
                grade: '3',
                dateOfBirth: '2012-11-08',
                address: '789 Pine Rd, Anytown, USA',
                parentName: 'Sarah Johnson',
                parentPhone: '+1-555-0128'
            }
        ];
        
        sampleStudents.forEach(student => {
            sms.addStudent(student);
        });
        
        // Add some sample attendance data
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            sms.students.forEach(student => {
                const statuses = ['present', 'present', 'present', 'absent', 'late'];
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                sms.markAttendance(student.id, dateStr, randomStatus);
            });
        }
        
        sms.showNotification('info', 'Sample Data Added', 'Sample students and attendance data have been added for demonstration.');
    }
}

// Add sample data button (for development/demo purposes)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const addSampleBtn = document.createElement('button');
        addSampleBtn.innerHTML = '<i class="fas fa-database"></i> Add Sample Data';
        addSampleBtn.className = 'btn btn-secondary';
        addSampleBtn.style.position = 'fixed';
        addSampleBtn.style.bottom = '20px';
        addSampleBtn.style.right = '20px';
        addSampleBtn.style.zIndex = '1000';
        addSampleBtn.onclick = addSampleData;
        document.body.appendChild(addSampleBtn);
    }, 2000);
});
