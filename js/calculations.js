// मुख्य एप्लिकेसन प्रणाली
class ConstructionManagementSystem {
    constructor() {
        this.currentWorkId = null;
        this.currentSection = 'dashboard';
        this.notifications = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        const settings = JSON.parse(localStorage.getItem('constructionSettings') || '{}');
        const notifEnabledCheckbox = document.getElementById('notifications-enabled');
        if (notifEnabledCheckbox) notifEnabledCheckbox.checked = settings.notificationsEnabled !== false;
        const notifDaysInput = document.getElementById('notification-days');
        if (notifDaysInput) notifDaysInput.value = settings.notificationDays || 30;
        this.loadDashboard();
        this.checkNotifications();
        this.setupNavigation();
        this.updateCurrentYear();
    }

    setupEventListeners() {
        // नेभिगेसन बटनहरू
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
            });
        });

        // कार्य सुरक्षित गर्ने बटन
        const saveWorkBtn = document.getElementById('save-work-btn');
        if (saveWorkBtn) {
            saveWorkBtn.addEventListener('click', () => this.saveWork());
        }

        // फारम रिसेट गर्ने बटन
        const resetFormBtn = document.getElementById('reset-form-btn');
        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', () => this.resetWorkForm());
        }

        // थप बिल बटन
        const addBillBtn = document.getElementById('add-bill-btn');
        if (addBillBtn) {
            addBillBtn.addEventListener('click', () => this.addBillItem());
        }

        // खोजी बटन
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchWorks());
        }

        // खाली गर्ने बटन
        const clearSearchBtn = document.getElementById('clear-search-btn');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => this.clearSearch());
        }

        // नोटिफिकेसन बटन
        const notificationsBtn = document.getElementById('notifications-btn');
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => this.showNotifications());
        }

        // पासवर्ड परिवर्तन बटन
        const changePasswordBtn = document.getElementById('change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => this.showPasswordModal());
        }

        // पासवर्ड सुरक्षित गर्ने बटन
        const savePasswordBtn = document.getElementById('save-password-btn');
        if (savePasswordBtn) {
            savePasswordBtn.addEventListener('click', () => this.updateUserPassword());
        }

        // मोडल बन्द गर्ने
        const closeModalButtons = document.querySelectorAll('.close-modal');
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => this.closeAllModals());
        });

        // मोडल बाहिर क्लिक गर्दा बन्द गर्ने
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // कार्यहरूको खोजी
        const worksSearchInput = document.getElementById('works-search');
        if (worksSearchInput) {
            worksSearchInput.addEventListener('input', () => this.filterWorksTable());
        }

        // कार्यहरूको फिल्टर
        const worksFilter = document.getElementById('works-filter');
        if (worksFilter) {
            worksFilter.addEventListener('change', () => this.filterWorksTable());
        }

        // यूजर पासवर्ड अपडेट
        const updateUserPasswordBtn = document.getElementById('update-user-password-btn');
        if (updateUserPasswordBtn) {
            updateUserPasswordBtn.addEventListener('click', () => this.updateUserPasswordAdmin());
        }

        // डाटा ब्याकअप
        const backupDataBtn = document.getElementById('backup-data-btn');
        if (backupDataBtn) {
            backupDataBtn.addEventListener('click', () => this.backupData());
        }

        // डाटा पुनर्स्थापना
        const restoreDataBtn = document.getElementById('restore-data-btn');
        if (restoreDataBtn) {
            restoreDataBtn.addEventListener('click', () => this.restoreData());
        }

        // डाटा मेटाउने
        const clearDataBtn = document.getElementById('clear-data-btn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => this.clearAllData());
        }

        // रिपोर्ट जनरेट
        const generateReportBtn = document.getElementById('generate-report-btn');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateReport());
        }

        // डाटा निर्यात
        const exportDataBtn = document.getElementById('export-data-btn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.exportData());
        }

        // रिपोर्ट प्रकार बटनहरू
        const reportTypeButtons = document.querySelectorAll('.report-type-btn');
        reportTypeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const reportType = e.currentTarget.dataset.report;
                this.showReportType(reportType);
            });
        });

        // अवस्थित बिलहरूको लागि इभेन्ट लिस्नर
        document.querySelectorAll('.bill-item').forEach(bill => {
            this.setupBillEventListeners(bill);
        });

        // पासवर्ड ‘भिउ’ टगल (एडमिन मात्र)
        const viewAdminBtn = document.getElementById('view-admin-password-btn');
        if (viewAdminBtn) {
            viewAdminBtn.addEventListener('click', () => {
                if (!auth.isAdmin()) { this.showMessage('एडमिन मात्र हेर्न मिल्छ', 'error'); return; }
                const span = document.getElementById('admin-password-mask');
                if (span) span.textContent = span.textContent.includes('*') ? auth.adminPassword : '********';
            });
        }
        const viewUserBtn = document.getElementById('view-user-password-btn');
        if (viewUserBtn) {
            viewUserBtn.addEventListener('click', () => {
                if (!auth.isAdmin()) { this.showMessage('एडमिन मात्र हेर्न मिल्छ', 'error'); return; }
                const span = document.getElementById('user-password-mask');
                if (span) span.textContent = span.textContent.includes('*') ? auth.userPassword : '********';
            });
        }

        const notifEnabledCheckbox = document.getElementById('notifications-enabled');
        if (notifEnabledCheckbox) {
            notifEnabledCheckbox.addEventListener('change', () => {
                const settings = JSON.parse(localStorage.getItem('constructionSettings') || '{}');
                settings.notificationsEnabled = notifEnabledCheckbox.checked;
                localStorage.setItem('constructionSettings', JSON.stringify(settings));
                this.checkNotifications();
            });
        }
        const notifDaysInput = document.getElementById('notification-days');
        if (notifDaysInput) {
            notifDaysInput.addEventListener('change', () => {
                const settings = JSON.parse(localStorage.getItem('constructionSettings') || '{}');
                settings.notificationDays = parseInt(notifDaysInput.value) || 30;
                localStorage.setItem('constructionSettings', JSON.stringify(settings));
                this.checkNotifications();
            });
        }
    }

    setupNavigation() {
        // URL बाट सेक्सन पहिचान गर्ने
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(`${hash}-section`)) {
            this.showSection(hash);
        }
    }

    showSection(sectionName) {
        // पुरानो सेक्सन लुकाउने
        const currentSection = document.querySelector('.section.active');
        if (currentSection) {
            currentSection.classList.remove('active');
        }

        // नयाँ सेक्सन देखाउने
        const newSection = document.getElementById(`${sectionName}-section`);
        if (newSection) {
            newSection.classList.add('active');
            
            // नेभिगेसन बटनहरू अपडेट गर्ने
            const navButtons = document.querySelectorAll('.nav-btn');
            navButtons.forEach(button => {
                button.classList.remove('active');
                if (button.dataset.section === sectionName) {
                    button.classList.add('active');
                }
            });

            // URL अपडेट गर्ने
            window.location.hash = sectionName;
            this.currentSection = sectionName;

            // सेक्सन अनुसार डाटा लोड गर्ने
            switch(sectionName) {
                case 'dashboard':
                    this.loadDashboard();
                    break;
                case 'view-works':
                    this.loadWorksTable();
                    break;
                case 'reports':
                    this.loadReports();
                    break;
                case 'admin':
                    this.loadAdminPanel();
                    break;
            }
        }
    }

    loadDashboard() {
        const works = this.getAllWorks();
        
        // ड्याशबोर्ड कार्डहरू अपडेट गर्ने
        document.getElementById('total-works').textContent = works.length;
        
        const expiringWorks = works.filter(work => this.isWorkExpiring(work)).length;
        document.getElementById('expiring-works').textContent = expiringWorks;
        
        const completedWorks = works.filter(work => work.status === 'completed').length;
        document.getElementById('completed-works').textContent = completedWorks;
        
        const notificationsCount = this.notifications.length;
        document.getElementById('dashboard-notifications').textContent = notificationsCount;
        
        // गतिविधिहरू लोड गर्ने
        this.loadActivities();
    }

    loadWorksTable() {
        const works = this.getAllWorks();
        const tableBody = document.getElementById('works-table-body');
        
        if (!tableBody) return;
        
        if (works.length === 0) {
            document.getElementById('no-works-message').classList.remove('hidden');
            tableBody.innerHTML = '';
            return;
        }
        
        document.getElementById('no-works-message').classList.add('hidden');
        
        let tableHTML = '';
        
        works.forEach((work, index) => {
            const status = this.getWorkStatus(work);
            const statusClass = this.getStatusClass(status);
            
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${work.workName || 'नाम नभएको'}</td>
                    <td>${work.contractorName || 'ठेकेदार नभएको'}</td>
                    <td>रु. ${this.formatNumber(work.tenderAmount || 0)}</td>
                    <td>${work.workCompletionDate ? this.formatDisplayDate(work.workCompletionDate) : 'मिति नभएको'}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn view" onclick="constructionSystem.viewWork('${work.id}')">
                            <i class="fas fa-eye"></i> हेर्नुहोस्
                        </button>
                        <button class="action-btn edit" onclick="constructionSystem.editWork('${work.id}')">
                            <i class="fas fa-edit"></i> सम्पादन
                        </button>
                        ${auth.isAdmin() ? `
                        <button class="action-btn delete" onclick="constructionSystem.deleteWork('${work.id}')">
                            <i class="fas fa-trash"></i> मेटाउनुहोस्
                        </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
    }

    saveWork() {
        // फारम डाटा संकलन गर्ने
        const workData = this.collectFormData();
        
        if (!this.validateWorkForm(workData)) {
            return;
        }
        
        // ID जोड्ने
        workData.id = this.currentWorkId || this.generateId();
        workData.createdAt = new Date().toISOString();
        workData.updatedAt = new Date().toISOString();
        workData.status = this.determineWorkStatus(workData);
        
        // कार्यहरूको सूची प्राप्त गर्ने
        let works = this.getAllWorks();
        
        if (this.currentWorkId) {
            // सम्पादन गर्दै
            const index = works.findIndex(w => w.id === this.currentWorkId);
            if (index !== -1) {
                works[index] = workData;
                this.showMessage('कार्य सफलतापूर्वक अपडेट गरियो', 'success');
            }
        } else {
            // नयाँ कार्य थप्दै
            works.unshift(workData);
            this.showMessage('कार्य सफलतापूर्वक सुरक्षित गरियो', 'success');
        }
        
        // स्थानीय भण्डारणमा सेभ गर्ने
        localStorage.setItem('constructionWorks', JSON.stringify(works));
        
        // गतिविधि लग थप्ने
        auth.logActivity(`"${workData.workName}" कार्य ${this.currentWorkId ? 'अपडेट गरियो' : 'थपियो'}`);
        
        // फारम रिसेट गर्ने
        this.resetWorkForm();
        
        // ड्याशबोर्ड अपडेट गर्ने
        this.loadDashboard();
        
        // नोटिफिकेसन जाँच गर्ने
        this.checkNotifications();
    }

    collectFormData() {
        return {
            // मूल विवरण
            workName: document.getElementById('work-name').value,
            workSite: document.getElementById('work-site').value,
            tenderAmount: parseFloat(document.getElementById('tender-amount').value) || 0,
            vatAmount: parseFloat(document.getElementById('vat-amount').value) || 0,
            
            // ठेकेदार विवरण
            contractorName: document.getElementById('contractor-name').value,
            contractorAddress: document.getElementById('contractor-address').value,
            contractorPhone: document.getElementById('contractor-phone').value,
            contractorEmail: document.getElementById('contractor-email').value,
            
            // समय सम्बन्धी विवरण
            tenderPublishDate: document.getElementById('tender-publish-date').value,
            magazineName: document.getElementById('magazine-name').value,
            magazineDate: document.getElementById('magazine-date').value,
            preBidMeeting: document.getElementById('pre-bid-meeting').value,
            tenderOpenDate: document.getElementById('tender-open-date').value,
            evaluationReportDate: document.getElementById('evaluation-report-date').value,
            intentLetterDate: document.getElementById('intent-letter-date').value,
            agreementDate: document.getElementById('agreement-date').value,
            workStartDate: document.getElementById('work-start-date').value,
            workCompletionDate: document.getElementById('work-completion-date').value,
            
            // जमानत विवरण
            workGuaranteeFrom: document.getElementById('work-guarantee-from').value,
            workGuaranteeTo: document.getElementById('work-guarantee-to').value,
            workGuaranteeAmount: parseFloat(document.getElementById('work-guarantee-amount').value) || 0,
            workGuaranteePercent: parseFloat(document.getElementById('work-guarantee-percent').value) || 0,
            
            advanceGuaranteeFrom: document.getElementById('advance-guarantee-from').value,
            advanceGuaranteeTo: document.getElementById('advance-guarantee-to').value,
            advanceGuaranteeAmount: parseFloat(document.getElementById('advance-guarantee-amount').value) || 0,
            advanceGuaranteePercent: parseFloat(document.getElementById('advance-guarantee-percent').value) || 0,
            
            otherGuaranteeFrom: document.getElementById('other-guarantee-from').value,
            otherGuaranteeTo: document.getElementById('other-guarantee-to').value,
            otherGuaranteeAmount: parseFloat(document.getElementById('other-guarantee-amount').value) || 0,
            otherGuaranteePercent: parseFloat(document.getElementById('other-guarantee-percent').value) || 0,
            
            insuranceFrom: document.getElementById('insurance-from').value,
            insuranceTo: document.getElementById('insurance-to').value,
            insuranceAmount: parseFloat(document.getElementById('insurance-amount').value) || 0,
            insurancePercent: parseFloat(document.getElementById('insurance-percent').value) || 0,
            
            // मोबिलाइजेशन
            firstMobilizationDate: document.getElementById('first-mobilization-date').value,
            firstMobilizationAmount: parseFloat(document.getElementById('first-mobilization-amount').value) || 0,
            secondMobilizationDate: document.getElementById('second-mobilization-date').value,
            secondMobilizationAmount: parseFloat(document.getElementById('second-mobilization-amount').value) || 0,
            
            // बिलहरू
            bills: this.collectBillsData(),
            
            // कार्य सम्पन्न विवरण
            workAcceptReport: document.getElementById('work-accept-report').value,
            workCompleteReport: document.getElementById('work-complete-report').value,
            planTransfer: document.getElementById('plan-transfer').value,
            
            // म्याद थप विवरण
            deadlineExtensionDate: document.getElementById('deadline-extension-date').value,
            extensionSubmitDate: document.getElementById('extension-submit-date').value,
            extensionDecisionDate: document.getElementById('extension-decision-date').value,
            extensionAuthority: document.getElementById('extension-authority').value,
            extensionPeriod: parseInt(document.getElementById('extension-period').value) || 0,
            extensionFinalDate: document.getElementById('extension-final-date').value,
            insuranceExtension: document.getElementById('insurance-extension').value,
            apgDate: document.getElementById('apg-date').value
        };
    }

    collectBillsData() {
        const billElements = document.querySelectorAll('.bill-item');
        const bills = [];
        
        billElements.forEach((billEl, index) => {
            const items = [];
            billEl.querySelectorAll('.bill-items-tbody tr').forEach(row => {
                items.push({
                    description: row.querySelector('.bill-item-desc').value,
                    unit: row.querySelector('.bill-item-unit').value,
                    qty: parseFloat(row.querySelector('.bill-item-qty').value) || 0,
                    rate: parseFloat(row.querySelector('.bill-item-rate').value) || 0,
                    amount: parseFloat(row.querySelector('.bill-item-amount').value) || 0
                });
            });

            bills.push({
                billNumber: index + 1,
                items: items,
                subTotal: parseFloat(billEl.querySelector('.bill-sub-total').value) || 0,
                priceAdjustment: parseFloat(billEl.querySelector('.bill-price-adjustment').value) || 0,
                totalAmount: parseFloat(billEl.querySelector('.bill-total-amount').value) || 0,
                vatAmount: parseFloat(billEl.querySelector('.bill-vat').value) || 0,
                grossTotal: parseFloat(billEl.querySelector('.bill-gross-total').value) || 0,
                retentionAmount: parseFloat(billEl.querySelector('.bill-retention').value) || 0,
                advanceRecovery: parseFloat(billEl.querySelector('.bill-advance-recovery').value) || 0,
                tdsAmount: parseFloat(billEl.querySelector('.bill-tds').value) || 0,
                totalDeduction: parseFloat(billEl.querySelector('.bill-total-deduction').value) || 0,
                netPayable: parseFloat(billEl.querySelector('.bill-net-payable').value) || 0,
                amount: parseFloat(billEl.querySelector('.bill-net-payable').value) || 0 // For compatibility
            });
        });
        
        return bills;
    }

    validateWorkForm(data) {
        const requiredFields = [
            { field: data.workName, name: 'निर्माण कार्यको नाम' },
            { field: data.workSite, name: 'निर्माण कार्यको साइट' },
            { field: data.tenderAmount, name: 'बोलपत्र रकम' },
            { field: data.contractorName, name: 'ठेकेदारको नाम' },
            { field: data.workCompletionDate, name: 'कार्य सम्पन्न मिति' }
        ];
        
        for (const required of requiredFields) {
            if (!required.field) {
                this.showMessage(`कृपया "${required.name}" भर्नुहोस्`, 'error');
                return false;
            }
        }
        
        if (data.tenderAmount <= 0) {
            this.showMessage('बोलपत्र रकम सकारात्मक हुनुपर्छ', 'error');
            return false;
        }
        
        return true;
    }

    resetWorkForm() {
        const form = document.getElementById('work-form');
        if (form) {
            form.reset();
            this.currentWorkId = null;
            
            // बिलहरूको कन्टेनर रिसेट गर्ने
            const billsContainer = document.getElementById('bills-container');
            if (billsContainer) {
                billsContainer.innerHTML = this.getBillHTML(1);
                this.setupBillEventListeners(billsContainer.firstElementChild);
            }
            
            // सन्देश खाली गर्ने
            this.showMessage('', '');
            
            // मितिहरू स्वचालित रूपमा सेट गर्ने
            const today = new Date();
            const todayFormatted = this.formatDate(today);
            
            // आजको मिति सेट गर्ने
            const dateInputs = [
                'tender-publish-date',
                'pre-bid-meeting',
                'tender-open-date',
                'evaluation-report-date',
                'intent-letter-date',
                'agreement-date',
                'work-start-date',
                'work-guarantee-from',
                'advance-guarantee-from',
                'other-guarantee-from',
                'insurance-from',
                'first-mobilization-date',
                'second-mobilization-date',
                'deadline-extension-date',
                'extension-submit-date',
                'extension-decision-date',
                'apg-date'
            ];
            
            dateInputs.forEach(inputId => {
                const input = document.getElementById(inputId);
                if (input && !input.readOnly) {
                    input.value = todayFormatted;
                }
            });
            
            // कार्य सम्पन्न मिति १ वर्ष पछिको मिति सेट गर्ने
            const oneYearLater = new Date(today);
            oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
            document.getElementById('work-completion-date').value = this.formatDate(oneYearLater);
            
            // गणना अपडेट गर्ने
            calculations.calculateWorkGuaranteeDate();
        }
    }

    // बिल HTML उत्पादन गर्ने हेल्पर प्रकार्य
    getBillHTML(index, bill = {}) {
        const billTitle = index === 1 ? 'प्रथम विल' : 
                         index === 2 ? 'दोस्रो विल' : 
                         index === 3 ? 'तेस्रो विल' : 
                         `बिल ${index}`;
        
        // Generate Items Rows
        let itemsHTML = '';
        const items = bill.items || [{ description: '', unit: '', qty: 0, rate: 0, amount: 0 }];
        items.forEach(item => {
            itemsHTML += this.getBillItemRowHTML(item);
        });

        return `
            <div class="bill-item" data-bill-index="${index}">
                <div class="bill-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h5>${billTitle}</h5>
                    ${index > 1 ? `
                    <button type="button" class="btn-secondary remove-bill-btn" style="padding: 5px 10px; font-size: 0.9em;">
                        <i class="fas fa-trash"></i> बिल हटाउनुहोस्
                    </button>
                    ` : ''}
                </div>

                <div class="bill-items-section" style="margin-bottom: 20px; overflow-x: auto;">
                    <table class="bill-items-table" style="width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 0.9em;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">क्र.सं.</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">विवरण (Description of Work)</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; width: 80px;">एकाइ</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; width: 100px;">परिमाण</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; width: 120px;">दर</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; width: 150px;">जम्मा रकम</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; width: 50px;"></th>
                            </tr>
                        </thead>
                        <tbody class="bill-items-tbody">
                            ${itemsHTML}
                        </tbody>
                    </table>
                    <button type="button" class="btn-secondary add-bill-row-btn" style="padding: 5px 10px; font-size: 0.9em;">
                        <i class="fas fa-plus"></i> थप पङ्क्ति
                    </button>
                </div>

                <div class="bill-summary" style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <div class="form-row">
                        <div class="form-group">
                            <label>(क) कूल जम्मा (Sub-Total)</label>
                            <input type="number" class="bill-sub-total" value="${bill.subTotal || 0}" readonly>
                        </div>
                        <div class="form-group">
                            <label>(ख) मूल्य समायोजन (Price Adjustment)</label>
                            <input type="number" class="bill-price-adjustment" value="${bill.priceAdjustment || 0}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>(ग) जम्मा (क + ख)</label>
                            <input type="number" class="bill-total-amount" value="${bill.totalAmount || 0}" readonly>
                        </div>
                        <div class="form-group">
                            <label>(घ) १३% मू.अ.कर (VAT)</label>
                            <input type="number" class="bill-vat" value="${bill.vatAmount || 0}" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>(ङ) कुल बिल रकम (Gross Total Amount)</label>
                            <input type="number" class="bill-gross-total" value="${bill.grossTotal || 0}" readonly>
                        </div>
                    </div>

                    <h6 style="margin: 15px 0 10px;">कट्टीहरू (Deductions):</h6>
                    <div class="form-row">
                        <div class="form-group">
                            <label>१. ५% रिटेन्सन मनी</label>
                            <input type="number" class="bill-retention" value="${bill.retentionAmount || 0}" readonly>
                        </div>
                        <div class="form-group">
                            <label>२. पेश्की फछ्र्यौट (Advance Recovery)</label>
                            <input type="number" class="bill-advance-recovery" value="${bill.advanceRecovery || 0}">
                        </div>
                        <div class="form-group">
                            <label>३. १.५% अग्रिम आयकर (TDS)</label>
                            <input type="number" class="bill-tds" value="${bill.tdsAmount || 0}" readonly>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>(च) कुल कट्टी रकम</label>
                            <input type="number" class="bill-total-deduction" value="${bill.totalDeduction || 0}" readonly>
                        </div>
                        <div class="form-group">
                            <label>(छ) खुद भुक्तानी योग्य रकम</label>
                            <input type="number" class="bill-net-payable" value="${bill.netPayable || 0}" readonly style="font-weight: bold;">
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // बिल आइटम पङ्क्ति HTML
    getBillItemRowHTML(item = {}) {
        return `
            <tr>
                <td class="row-index" style="border: 1px solid #dee2e6; padding: 5px; text-align: center;"></td>
                <td style="border: 1px solid #dee2e6; padding: 5px;">
                    <input type="text" class="bill-item-desc" value="${item.description || ''}" style="width: 100%; border: 1px solid #ced4da; padding: 4px;">
                </td>
                <td style="border: 1px solid #dee2e6; padding: 5px;">
                    <input type="text" class="bill-item-unit" value="${item.unit || ''}" style="width: 100%; border: 1px solid #ced4da; padding: 4px;">
                </td>
                <td style="border: 1px solid #dee2e6; padding: 5px;">
                    <input type="number" class="bill-item-qty" value="${item.qty || ''}" step="any" style="width: 100%; border: 1px solid #ced4da; padding: 4px;">
                </td>
                <td style="border: 1px solid #dee2e6; padding: 5px;">
                    <input type="number" class="bill-item-rate" value="${item.rate || ''}" step="any" style="width: 100%; border: 1px solid #ced4da; padding: 4px;">
                </td>
                <td style="border: 1px solid #dee2e6; padding: 5px;">
                    <input type="number" class="bill-item-amount" value="${item.amount || ''}" readonly style="width: 100%; border: 1px solid #ced4da; padding: 4px; background-color: #e9ecef;">
                </td>
                <td style="border: 1px solid #dee2e6; padding: 5px; text-align: center;">
                    <button type="button" class="btn-danger remove-row-btn" style="padding: 2px 6px;">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    // बिल इभेन्ट लिस्नरहरू सेटअप गर्ने
    setupBillEventListeners(billElement) {
        // पङ्क्ति थप्ने बटन
        const addRowBtn = billElement.querySelector('.add-bill-row-btn');
        if (addRowBtn) {
            addRowBtn.addEventListener('click', () => {
                const tbody = billElement.querySelector('.bill-items-tbody');
                tbody.insertAdjacentHTML('beforeend', this.getBillItemRowHTML());
                this.updateRowIndices(tbody);
                this.setupBillRowListeners(tbody.lastElementChild, billElement);
            });
        }

        // पङ्क्ति हटाउने र इनपुट परिवर्तन सुन्ने
        const tbody = billElement.querySelector('.bill-items-tbody');
        if (tbody) {
            // अवस्थित पङ्क्तिहरूका लागि
            Array.from(tbody.children).forEach(row => {
                this.setupBillRowListeners(row, billElement);
            });
            this.updateRowIndices(tbody);
        }

        // अन्य इनपुटहरू (मूल्य समायोजन, पेश्की फछ्र्यौट)
        const inputs = billElement.querySelectorAll('.bill-price-adjustment, .bill-advance-recovery');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculateBillTotals(billElement));
        });

        // बिल हटाउने बटन
        const removeBtn = billElement.querySelector('.remove-bill-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                billElement.remove();
            });
        }
    }

    setupBillRowListeners(row, billElement) {
        // हटाउने बटन
        const removeBtn = row.querySelector('.remove-row-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                const tbody = row.parentElement;
                row.remove();
                this.updateRowIndices(tbody);
                this.calculateBillTotals(billElement);
            });
        }

        // गणनाका लागि इनपुटहरू
        const inputs = row.querySelectorAll('.bill-item-qty, .bill-item-rate');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                const qty = parseFloat(row.querySelector('.bill-item-qty').value) || 0;
                const rate = parseFloat(row.querySelector('.bill-item-rate').value) || 0;
                const amount = qty * rate;
                row.querySelector('.bill-item-amount').value = amount.toFixed(2);
                this.calculateBillTotals(billElement);
            });
        });
    }

    updateRowIndices(tbody) {
        Array.from(tbody.children).forEach((row, index) => {
            row.querySelector('.row-index').textContent = index + 1;
        });
    }

    calculateBillTotals(billElement) {
        // १. सब-टोटल गणना
        let subTotal = 0;
        billElement.querySelectorAll('.bill-item-amount').forEach(input => {
            subTotal += parseFloat(input.value) || 0;
        });
        billElement.querySelector('.bill-sub-total').value = subTotal.toFixed(2);

        // २. मूल्य समायोजन
        const priceAdjustment = parseFloat(billElement.querySelector('.bill-price-adjustment').value) || 0;

        // ३. जम्मा (क + ख)
        const totalAmount = subTotal + priceAdjustment;
        billElement.querySelector('.bill-total-amount').value = totalAmount.toFixed(2);

        // ४. १३% भ्याट
        const vatAmount = totalAmount * 0.13;
        billElement.querySelector('.bill-vat').value = vatAmount.toFixed(2);

        // ५. कुल बिल रकम (Gross Total)
        const grossTotal = totalAmount + vatAmount;
        billElement.querySelector('.bill-gross-total').value = grossTotal.toFixed(2);

        // ६. कट्टीहरू
        // ५% रिटेन्सन
        const retention = grossTotal * 0.05;
        billElement.querySelector('.bill-retention').value = retention.toFixed(2);

        // १.५% टिडिएस
        const tds = grossTotal * 0.015;
        billElement.querySelector('.bill-tds').value = tds.toFixed(2);

        // पेश्की फछ्र्यौट
        const advanceRecovery = parseFloat(billElement.querySelector('.bill-advance-recovery').value) || 0;

        // कुल कट्टी
        const totalDeduction = retention + tds + advanceRecovery;
        billElement.querySelector('.bill-total-deduction').value = totalDeduction.toFixed(2);

        // ७. खुद भुक्तानी
        const netPayable = grossTotal - totalDeduction;
        billElement.querySelector('.bill-net-payable').value = netPayable.toFixed(2);
    }

    addBillItem() {
        const billsContainer = document.getElementById('bills-container');
        const billItems = document.querySelectorAll('.bill-item');
        const nextIndex = billItems.length + 1;
        
        const billHTML = this.getBillHTML(nextIndex);
        billsContainer.insertAdjacentHTML('beforeend', billHTML);
        
        // नयाँ बिलको लागि इभेन्ट लिस्नरहरू
        this.setupBillEventListeners(billsContainer.lastElementChild);
    }

    viewWork(workId) {
        const works = this.getAllWorks();
        const work = works.find(w => w.id === workId);
        
        if (!work) {
            this.showMessage('कार्य फेला परेन', 'error');
            return;
        }
        
        // कार्य विवरण देखाउने मोडल बनाउने
        this.showWorkDetailsModal(work);
    }

    editWork(workId) {
        const works = this.getAllWorks();
        const work = works.find(w => w.id === workId);
        
        if (!work) {
            this.showMessage('कार्य फेला परेन', 'error');
            return;
        }
        
        // फारम भर्ने
        this.populateWorkForm(work);
        
        // नयाँ कार्य सेक्सनमा जाने
        this.showSection('add-work');
        
        // सन्देश देखाउने
        this.showMessage('कार्य सम्पादन गर्नुहोस्। परिवर्तन गरेपछि सुरक्षित गर्नुहोस्।', 'success');
    }

    deleteWork(workId) {
        if (!confirm('के तपाईं यो कार्य मेटाउन निश्चित हुनुहुन्छ?')) {
            return;
        }
        
        let works = this.getAllWorks();
        const workIndex = works.findIndex(w => w.id === workId);
        
        if (workIndex === -1) {
            this.showMessage('कार्य फेला परेन', 'error');
            return;
        }
        
        const workName = works[workIndex].workName;
        works.splice(workIndex, 1);
        
        localStorage.setItem('constructionWorks', JSON.stringify(works));
        
        // गतिविधि लग थप्ने
        auth.logActivity(`"${workName}" कार्य मेटाइयो`);
        
        // ड्याशबोर्ड अपडेट गर्ने
        this.loadDashboard();
        
        // कार्यहरूको तालिका अपडेट गर्ने
        this.loadWorksTable();
        
        this.showMessage('कार्य सफलतापूर्वक मेटाइयो', 'success');
    }

    populateWorkForm(work) {
        this.currentWorkId = work.id;
        
        // मूल विवरण
        document.getElementById('work-name').value = work.workName || '';
        document.getElementById('work-site').value = work.workSite || '';
        document.getElementById('tender-amount').value = work.tenderAmount || '';
        document.getElementById('vat-amount').value = work.vatAmount || '';
        
        // ठेकेदार विवरण
        document.getElementById('contractor-name').value = work.contractorName || '';
        document.getElementById('contractor-address').value = work.contractorAddress || '';
        document.getElementById('contractor-phone').value = work.contractorPhone || '';
        document.getElementById('contractor-email').value = work.contractorEmail || '';
        
        // समय सम्बन्धी विवरण
        document.getElementById('tender-publish-date').value = work.tenderPublishDate || '';
        document.getElementById('magazine-name').value = work.magazineName || '';
        document.getElementById('magazine-date').value = work.magazineDate || '';
        document.getElementById('pre-bid-meeting').value = work.preBidMeeting || '';
        document.getElementById('tender-open-date').value = work.tenderOpenDate || '';
        document.getElementById('evaluation-report-date').value = work.evaluationReportDate || '';
        document.getElementById('intent-letter-date').value = work.intentLetterDate || '';
        document.getElementById('agreement-date').value = work.agreementDate || '';
        document.getElementById('work-start-date').value = work.workStartDate || '';
        document.getElementById('work-completion-date').value = work.workCompletionDate || '';
        
        // जमानत विवरण
        document.getElementById('work-guarantee-from').value = work.workGuaranteeFrom || '';
        document.getElementById('work-guarantee-to').value = work.workGuaranteeTo || '';
        document.getElementById('work-guarantee-amount').value = work.workGuaranteeAmount || '';
        document.getElementById('work-guarantee-percent').value = work.workGuaranteePercent || '';
        
        document.getElementById('advance-guarantee-from').value = work.advanceGuaranteeFrom || '';
        document.getElementById('advance-guarantee-to').value = work.advanceGuaranteeTo || '';
        document.getElementById('advance-guarantee-amount').value = work.advanceGuaranteeAmount || '';
        document.getElementById('advance-guarantee-percent').value = work.advanceGuaranteePercent || '';
        
        document.getElementById('other-guarantee-from').value = work.otherGuaranteeFrom || '';
        document.getElementById('other-guarantee-to').value = work.otherGuaranteeTo || '';
        document.getElementById('other-guarantee-amount').value = work.otherGuaranteeAmount || '';
        document.getElementById('other-guarantee-percent').value = work.otherGuaranteePercent || '';
        
        document.getElementById('insurance-from').value = work.insuranceFrom || '';
        document.getElementById('insurance-to').value = work.insuranceTo || '';
        document.getElementById('insurance-amount').value = work.insuranceAmount || '';
        document.getElementById('insurance-percent').value = work.insurancePercent || '';
        
        // मोबिलाइजेशन
        document.getElementById('first-mobilization-date').value = work.firstMobilizationDate || '';
        document.getElementById('first-mobilization-amount').value = work.firstMobilizationAmount || '';
        document.getElementById('second-mobilization-date').value = work.secondMobilizationDate || '';
        document.getElementById('second-mobilization-amount').value = work.secondMobilizationAmount || '';
        
        // बिलहरू
        this.populateBills(work.bills || []);
        
        // कार्य सम्पन्न विवरण
        document.getElementById('work-accept-report').value = work.workAcceptReport || '';
        document.getElementById('work-complete-report').value = work.workCompleteReport || '';
        document.getElementById('plan-transfer').value = work.planTransfer || '';
        
        // म्याद थप विवरण
        document.getElementById('deadline-extension-date').value = work.deadlineExtensionDate || '';
        document.getElementById('extension-submit-date').value = work.extensionSubmitDate || '';
        document.getElementById('extension-decision-date').value = work.extensionDecisionDate || '';
        document.getElementById('extension-authority').value = work.extensionAuthority || '';
        document.getElementById('extension-period').value = work.extensionPeriod || '';
        document.getElementById('extension-final-date').value = work.extensionFinalDate || '';
        document.getElementById('insurance-extension').value = work.insuranceExtension || '';
        document.getElementById('apg-date').value = work.apgDate || '';
        
        // गणना अपडेट गर्ने
        calculations.calculateWorkGuaranteeDate();
        calculations.calculateExtensionDates();
    }

    populateBills(bills) {
        const billsContainer = document.getElementById('bills-container');
        billsContainer.innerHTML = '';
        
        bills.forEach((bill, index) => {
            const billHTML = this.getBillHTML(index + 1, bill);
            billsContainer.insertAdjacentHTML('beforeend', billHTML);
            this.setupBillEventListeners(billsContainer.lastElementChild);
        });
    }

    showWorkDetailsModal(work) {
        // मोडल बनाउने र भर्ने
        const modalHTML = `
            <div class="modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-hard-hat"></i> ${work.workName}</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="work-details">
                            <h4>कार्य विवरण</h4>
                            <div class="detail-row">
                                <div class="detail-item">
                                    <strong>कार्य साइट:</strong> ${work.workSite || 'नभएको'}
                                </div>
                                <div class="detail-item">
                                    <strong>बोलपत्र रकम:</strong> रु. ${this.formatNumber(work.tenderAmount || 0)}
                                </div>
                            </div>
                            
                            <h4>ठेकेदार विवरण</h4>
                            <div class="detail-row">
                                <div class="detail-item">
                                    <strong>नाम:</strong> ${work.contractorName || 'नभएको'}
                                </div>
                                <div class="detail-item">
                                    <strong>फोन:</strong> ${work.contractorPhone || 'नभएको'}
                                </div>
                            </div>
                            <div class="detail-row">
                                <div class="detail-item">
                                    <strong>ठेगाना:</strong> ${work.contractorAddress || 'नभएको'}
                                </div>
                                <div class="detail-item">
                                    <strong>इमेल:</strong> ${work.contractorEmail || 'नभएको'}
                                </div>
                            </div>
                            
                            <h4>समयरेखा</h4>
                            <div class="detail-row">
                                <div class="detail-item">
                                    <strong>कार्य शुरु मिति:</strong> ${work.workStartDate ? this.formatDisplayDate(work.workStartDate) : 'नभएको'}
                                </div>
                                <div class="detail-item">
                                    <strong>कार्य सम्पन्न मिति:</strong> ${work.workCompletionDate ? this.formatDisplayDate(work.workCompletionDate) : 'नभएको'}
                                </div>
                            </div>
                            
                            <h4>वित्तिय विवरण</h4>
                            <div class="detail-row">
                                <div class="detail-item">
                                    <strong>कुल बिलहरू:</strong> ${work.bills ? work.bills.length : 0}
                                </div>
                                <div class="detail-item">
                                    <strong>कुल रकम:</strong> रु. ${this.formatNumber(this.calculateTotalBillsAmount(work.bills))}
                                </div>
                            </div>
                            
                            <h4>स्थिति</h4>
                            <div class="status-info">
                                <span class="status-badge ${this.getStatusClass(this.getWorkStatus(work))}">
                                    ${this.getWorkStatus(work)}
                                </span>
                                <p>अन्तिम अपडेट: ${this.formatDisplayDate(work.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary close-modal">बन्द गर्नुहोस्</button>
                        ${auth.isAdmin() ? `
                        <button class="btn-primary" onclick="constructionSystem.editWork('${work.id}')">
                            <i class="fas fa-edit"></i> सम्पादन गर्नुहोस्
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // मोडल DOM मा थप्ने
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // मोडल बन्द गर्ने इभेन्ट लिस्नर थप्ने
        const modal = document.querySelector('.modal:last-child');
        const closeButtons = modal.querySelectorAll('.close-modal');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.remove();
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    searchWorks() {
        const searchData = {
            workName: document.getElementById('search-work-name').value.toLowerCase(),
            contractor: document.getElementById('search-contractor').value.toLowerCase(),
            site: document.getElementById('search-site').value.toLowerCase(),
            status: document.getElementById('search-status').value,
            dateFrom: document.getElementById('search-date-from').value,
            dateTo: document.getElementById('search-date-to').value,
            amountMin: parseFloat(document.getElementById('search-amount-min').value) || 0,
            amountMax: parseFloat(document.getElementById('search-amount-max').value) || Infinity
        };
        
        const works = this.getAllWorks();
        const results = works.filter(work => {
            // नाम द्वारा खोज्ने
            if (searchData.workName && !work.workName.toLowerCase().includes(searchData.workName)) {
                return false;
            }
            
            // ठेकेदार द्वारा खोज्ने
            if (searchData.contractor && !work.contractorName.toLowerCase().includes(searchData.contractor)) {
                return false;
            }
            
            // साइट द्वारा खोज्ने
            if (searchData.site && !work.workSite.toLowerCase().includes(searchData.site)) {
                return false;
            }
            
            // स्थिति द्वारा खोज्ने
            if (searchData.status && this.getWorkStatus(work) !== searchData.status) {
                return false;
            }
            
            // मिति द्वारा खोज्ने
            if (searchData.dateFrom && work.workCompletionDate && work.workCompletionDate < searchData.dateFrom) {
                return false;
            }
            
            if (searchData.dateTo && work.workCompletionDate && work.workCompletionDate > searchData.dateTo) {
                return false;
            }
            
            // रकम द्वारा खोज्ने
            if (work.tenderAmount < searchData.amountMin || work.tenderAmount > searchData.amountMax) {
                return false;
            }
            
            return true;
        });
        
        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        const container = document.getElementById('search-results-container');
        
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>कुनै कार्यहरू फेला परेनन्</p>
                </div>
            `;
            return;
        }
        
        let resultsHTML = '<div class="search-results-grid">';
        
        results.forEach(work => {
            const status = this.getWorkStatus(work);
            const statusClass = this.getStatusClass(status);
            
            resultsHTML += `
                <div class="search-result-card">
                    <div class="result-card-header">
                        <h4>${work.workName}</h4>
                        <span class="status-badge ${statusClass}">${status}</span>
                    </div>
                    <div class="result-card-body">
                        <p><strong>ठेगाना:</strong> ${work.workSite || 'नभएको'}</p>
                        <p><strong>ठेकेदार:</strong> ${work.contractorName || 'नभएको'}</p>
                        <p><strong>बोलपत्र रकम:</strong> रु. ${this.formatNumber(work.tenderAmount || 0)}</p>
                        <p><strong>सम्पन्न मिति:</strong> ${work.workCompletionDate ? this.formatDisplayDate(work.workCompletionDate) : 'नभएको'}</p>
                    </div>
                    <div class="result-card-footer">
                        <button class="btn-secondary" onclick="constructionSystem.viewWork('${work.id}')">
                            <i class="fas fa-eye"></i> हेर्नुहोस्
                        </button>
                        ${auth.isAdmin() ? `
                        <button class="btn-primary" onclick="constructionSystem.editWork('${work.id}')">
                            <i class="fas fa-edit"></i> सम्पादन
                        </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        resultsHTML += '</div>';
        container.innerHTML = resultsHTML;
    }

    clearSearch() {
        const searchInputs = [
            'search-work-name',
            'search-contractor',
            'search-site',
            'search-status',
            'search-date-from',
            'search-date-to',
            'search-amount-min',
            'search-amount-max'
        ];
        
        searchInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                if (input.type === 'select-one') {
                    input.selectedIndex = 0;
                } else {
                    input.value = '';
                }
            }
        });
        
        const container = document.getElementById('search-results-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    filterWorksTable() {
        const searchTerm = document.getElementById('works-search').value.toLowerCase();
        const filterValue = document.getElementById('works-filter').value;
        
        const works = this.getAllWorks();
        let filteredWorks = works;
        
        // खोजी अप्लाई गर्ने
        if (searchTerm) {
            filteredWorks = filteredWorks.filter(work => 
                work.workName.toLowerCase().includes(searchTerm) ||
                work.contractorName.toLowerCase().includes(searchTerm) ||
                work.workSite.toLowerCase().includes(searchTerm)
            );
        }
        
        // फिल्टर अप्लाई गर्ने
        if (filterValue !== 'all') {
            filteredWorks = filteredWorks.filter(work => {
                const status = this.getWorkStatus(work);
                if (filterValue === 'active') {
                    return status === 'active';
                } else if (filterValue === 'completed') {
                    return status === 'completed';
                } else if (filterValue === 'expiring') {
                    return this.isWorkExpiring(work);
                }
                return true;
            });
        }
        
        // तालिका अपडेट गर्ने
        this.updateWorksTable(filteredWorks);
    }

    updateWorksTable(works) {
        const tableBody = document.getElementById('works-table-body');
        
        if (!tableBody) return;
        
        if (works.length === 0) {
            document.getElementById('no-works-message').classList.remove('hidden');
            tableBody.innerHTML = '';
            return;
        }
        
        document.getElementById('no-works-message').classList.add('hidden');
        
        let tableHTML = '';
        
        works.forEach((work, index) => {
            const status = this.getWorkStatus(work);
            const statusClass = this.getStatusClass(status);
            
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${work.workName || 'नाम नभएको'}</td>
                    <td>${work.contractorName || 'ठेकेदार नभएको'}</td>
                    <td>रु. ${this.formatNumber(work.tenderAmount || 0)}</td>
                    <td>${work.workCompletionDate ? this.formatDisplayDate(work.workCompletionDate) : 'मिति नभएको'}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td class="actions-cell">
                        <button class="action-btn view" onclick="constructionSystem.viewWork('${work.id}')">
                            <i class="fas fa-eye"></i> हेर्नुहोस्
                        </button>
                        <button class="action-btn edit" onclick="constructionSystem.editWork('${work.id}')">
                            <i class="fas fa-edit"></i> सम्पादन
                        </button>
                        ${auth.isAdmin() ? `
                        <button class="action-btn delete" onclick="constructionSystem.deleteWork('${work.id}')">
                            <i class="fas fa-trash"></i> मेटाउनुहोस्
                        </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHTML;
    }

    checkNotifications() {
        const settings = JSON.parse(localStorage.getItem('constructionSettings') || '{}');
        const enabled = settings.notificationsEnabled !== false;
        const days = parseInt(settings.notificationDays) || 30;

        const notificationCount = document.getElementById('notification-count');
        const dashboardNotifications = document.getElementById('dashboard-notifications');

        if (!enabled) {
            this.notifications = [];
            if (notificationCount) notificationCount.classList.add('hidden');
            if (dashboardNotifications) dashboardNotifications.textContent = '0';
            return;
        }

        this.notifications = calculations.checkExpiringDates(days);

        if (this.notifications.length > 0) {
            if (notificationCount) {
                notificationCount.textContent = this.notifications.length;
                notificationCount.classList.remove('hidden');
            }
            if (dashboardNotifications) {
                dashboardNotifications.textContent = this.notifications.length;
            }
        } else {
            if (notificationCount) {
                notificationCount.classList.add('hidden');
            }
            if (dashboardNotifications) {
                dashboardNotifications.textContent = '0';
            }
        }
    }

    showNotifications() {
        const modal = document.getElementById('notification-modal');
        const list = document.getElementById('notifications-list');
        
        if (!modal || !list) return;
        
        // नोटिफिकेसनहरू प्रदर्शन गर्ने
        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="empty-state" style="padding: 40px 20px;">
                    <i class="fas fa-bell-slash"></i>
                    <p>कुनै नोटिफिकेसन छैनन्</p>
                </div>
            `;
        } else {
            let notificationsHTML = '';
            
            this.notifications.forEach((notification, index) => {
                const iconClass = notification.type === 'warning' ? 'warning' : 'info';
                const icon = notification.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
                
                notificationsHTML += `
                    <div class="notification-item ${index < 3 ? 'unread' : ''}">
                        <div class="notification-icon ${iconClass}">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="notification-content">
                            <h4>${notification.title}</h4>
                            <p>${notification.message}</p>
                            <small>${this.formatDisplayDate(notification.date)}</small>
                        </div>
                    </div>
                `;
            });
            
            list.innerHTML = notificationsHTML;
        }
        
        // मोडल देखाउने
        modal.classList.remove('hidden');
        
        // सबै पढिएको चिन्ह लगाउने बटन
        const markAllReadBtn = document.getElementById('mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.onclick = () => {
                // यहाँ नोटिफिकेसनहरू पढिएको रूपमा चिन्ह लगाउने तर्क
                this.notifications = [];
                this.checkNotifications();
                modal.classList.add('hidden');
                this.showMessage('सबै नोटिफिकेसनहरू पढिएको चिन्ह लगाइयो', 'success');
            };
        }
    }

    showPasswordModal() {
        const modal = document.getElementById('password-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // फारम रिसेट गर्ने
            const form = document.getElementById('password-form');
            if (form) {
                form.reset();
            }
            
            const messageDiv = document.getElementById('password-message');
            if (messageDiv) {
                messageDiv.textContent = '';
                messageDiv.className = 'message';
            }
        }
    }

    updateUserPassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const messageDiv = document.getElementById('password-message');
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showPasswordMessage('कृपया सबै क्षेत्रहरू भर्नुहोस्', 'error', messageDiv);
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showPasswordMessage('नयाँ पासवर्डहरू मेल खादैनन्', 'error', messageDiv);
            return;
        }
        
        if (currentPassword !== auth.userPassword) {
            this.showPasswordMessage('हालको पासवर्ड गलत छ', 'error', messageDiv);
            return;
        }
        
        // पासवर्ड अपडेट गर्ने
        auth.userPassword = newPassword;
        this.showPasswordMessage('पासवर्ड सफलतापूर्वक परिवर्तन गरियो', 'success', messageDiv);
        
        // गतिविधि लग थप्ने
        auth.logActivity('पासवर्ड परिवर्तन गरियो');
        
        // २ सेकेन्ड पछि मोडल बन्द गर्ने
        setTimeout(() => {
            const modal = document.getElementById('password-modal');
            if (modal) {
                modal.classList.add('hidden');
            }
        }, 2000);
    }

    updateUserPasswordAdmin() {
        if (!auth.isAdmin()) {
            this.showMessage('यो कार्य गर्न एडमिन अधिकार आवश्यक छ', 'error');
            return;
        }
        
        const newPassword = document.getElementById('user-password').value;
        
        if (!newPassword) {
            this.showMessage('कृपया नयाँ पासवर्ड भर्नुहोस्', 'error');
            return;
        }
        
        if (newPassword.length < 4) {
            this.showMessage('पासवर्ड कम्तिमा ४ अक्षरको हुनुपर्छ', 'error');
            return;
        }
        
        // यूजर पासवर्ड अपडेट गर्ने
        auth.userPassword = newPassword;
        
        // स्थानीय भण्डारणमा सेभ गर्ने
        const userData = JSON.parse(localStorage.getItem('constructionUser') || '{}');
        localStorage.setItem('constructionUser', JSON.stringify(userData));
        
        this.showMessage('यूजर पासवर्ड सफलतापूर्वक अपडेट गरियो', 'success');
        
        // गतिविधि लग थप्ने
        auth.logActivity('यूजर पासवर्ड अपडेट गरियो');
        
        // इनपुट खाली गर्ने
        document.getElementById('user-password').value = '';
    }

    backupData() {
        const works = this.getAllWorks();
        const activities = JSON.parse(localStorage.getItem('constructionActivities') || '[]');
        const settings = JSON.parse(localStorage.getItem('constructionSettings') || '{}');
        
        const backupData = {
            works,
            activities,
            settings,
            backupDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `construction-backup-${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showMessage('डाटा ब्याकअप सफलतापूर्वक डाउनलोड गरियो', 'success');
        
        // गतिविधि लग थप्ने
        auth.logActivity('डाटा ब्याकअप गरियो');
    }

    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const backupData = JSON.parse(event.target.result);
                    
                    // डाटा भ्यालिडेसन गर्ने
                    if (!backupData.works || !Array.isArray(backupData.works)) {
                        throw new Error('अवैध ब्याकअप फाइल');
                    }
                    
                    if (!confirm('यो ब्याकअप लोड गर्दा हालको डाटा ओभरराइट हुनेछ। के तपाईं निश्चित हुनुहुन्छ?')) {
                        return;
                    }
                    
                    // डाटा पुनर्स्थापना गर्ने
                    localStorage.setItem('constructionWorks', JSON.stringify(backupData.works));
                    
                    if (backupData.activities) {
                        localStorage.setItem('constructionActivities', JSON.stringify(backupData.activities));
                    }
                    
                    if (backupData.settings) {
                        localStorage.setItem('constructionSettings', JSON.stringify(backupData.settings));
                    }
                    
                    this.showMessage('डाटा सफलतापूर्वक पुनर्स्थापना गरियो', 'success');
                    
                    // गतिविधि लग थप्ने
                    auth.logActivity('डाटा पुनर्स्थापना गरियो');
                    
                    // UI अपडेट गर्ने
                    this.loadDashboard();
                    this.loadWorksTable();
                    
                } catch (error) {
                    this.showMessage('ब्याकअप फाइल लोड गर्न असफल: ' + error.message, 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    clearAllData() {
        if (!auth.isAdmin()) {
            this.showMessage('यो कार्य गर्न एडमिन अधिकार आवश्यक छ', 'error');
            return;
        }
        
        if (!confirm('के तपाईं सबै डाटा मेटाउन निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।')) {
            return;
        }
        
        // सबै डाटा मेटाउने
        localStorage.removeItem('constructionWorks');
        localStorage.removeItem('constructionActivities');
        localStorage.removeItem('constructionSettings');
        
        this.showMessage('सबै डाटा सफलतापूर्वक मेटाइयो', 'success');
        
        // गतिविधि लग थप्ने
        auth.logActivity('सबै डाटा मेटाइयो');
        
        // UI अपडेट गर्ने
        this.loadDashboard();
        this.loadWorksTable();
    }

    loadActivities() {
        const activities = JSON.parse(localStorage.getItem('constructionActivities') || '[]');
        const container = document.getElementById('activities-list');
        
        if (!container) return;
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 20px;">
                    <p>कुनै गतिविधिहरू छैनन्</p>
                </div>
            `;
            return;
        }
        
        let activitiesHTML = '';
        
        activities.slice(0, 10).forEach(activity => {
            activitiesHTML += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <div class="activity-content">
                        <p>${activity.activity}</p>
                        <small>${this.formatDisplayDate(activity.timestamp)} - ${activity.user === 'admin' ? 'एडमिन' : 'यूजर'}</small>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = activitiesHTML;
    }

    loadReports() {
        const works = this.getAllWorks();
        
        // सारांश रिपोर्ट
        document.getElementById('report-total-works').textContent = works.length;
        
        const totalAmount = works.reduce((sum, work) => sum + (work.tenderAmount || 0), 0);
        document.getElementById('report-total-amount').textContent = `रु. ${this.formatNumber(totalAmount)}`;
        
        const activeWorks = works.filter(work => this.getWorkStatus(work) === 'active').length;
        document.getElementById('report-active-works').textContent = activeWorks;
        
        const completedWorks = works.filter(work => this.getWorkStatus(work) === 'completed').length;
        document.getElementById('report-completed-works').textContent = completedWorks;
        
        // चार्ट अपडेट गर्ने (यदि चार्ट लाइब्रेरी उपलब्ध छ भने)
        this.updateStatusChart(works);
    }

    loadAdminPanel() {
        const works = this.getAllWorks();
        const activities = JSON.parse(localStorage.getItem('constructionActivities') || '[]');
        
        // प्रणाली जानकारी अपडेट गर्ने
        document.getElementById('total-data-entries').textContent = works.length;
        document.getElementById('last-update-date').textContent = this.formatDisplayDate(new Date().toISOString());
        
        // भण्डारण प्रयोग गणना गर्ने
        let storageSize = 0;
        const keys = ['constructionWorks', 'constructionActivities', 'constructionSettings', 'constructionUser'];
        
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                storageSize += new Blob([data]).size;
            }
        });
        
        document.getElementById('storage-usage').textContent = this.formatFileSize(storageSize);
    }

    showReportType(reportType) {
        // रिपोर्ट प्रकार बटनहरू अपडेट गर्ने
        const reportButtons = document.querySelectorAll('.report-type-btn');
        reportButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.report === reportType) {
                button.classList.add('active');
            }
        });
        
        // रिपोर्ट सेक्सनहरू अपडेट गर्ने
        const reportSections = document.querySelectorAll('.report-section');
        reportSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${reportType}-report`) {
                section.classList.add('active');
            }
        });
    }

    generateReport() {
        const works = this.getAllWorks();
        const activeReport = document.querySelector('.report-type-btn.active').dataset.report;
        
        let reportContent = '';
        let reportTitle = '';
        
        switch(activeReport) {
            case 'summary':
                reportTitle = 'कार्यहरूको सारांश रिपोर्ट';
                reportContent = this.generateSummaryReport(works);
                break;
            case 'financial':
                reportTitle = 'वित्तिय रिपोर्ट';
                reportContent = this.generateFinancialReport(works);
                break;
            case 'timeline':
                reportTitle = 'समयरेखा रिपोर्ट';
                reportContent = this.generateTimelineReport(works);
                break;
            case 'contractor':
                reportTitle = 'ठेकेदार रिपोर्ट';
                reportContent = this.generateContractorReport(works);
                break;
        }
        
        // PDF जनरेट गर्ने (यहाँ साधारण HTML प्रिन्ट प्रयोग गरिएको छ)
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${reportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #2c3e50; color: white; }
                    .total-row { font-weight: bold; background-color: #f5f5f5; }
                    .footer { margin-top: 40px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <h1>${reportTitle}</h1>
                <p>रिपोर्ट मिति: ${this.formatDisplayDate(new Date().toISOString())}</p>
                <p>कुल कार्यहरू: ${works.length}</p>
                ${reportContent}
                <div class="footer">
                    <p>सार्वजनिक निर्माण कार्य प्रबन्धन प्रणाली</p>
                    <p>रिपोर्ट जनरेट गरिएको मिति: ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        
        this.showMessage('रिपोर्ट जनरेट गरियो र प्रिन्ट गर्न तयार छ', 'success');
    }

    generateSummaryReport(works) {
        let html = '<h2>कार्यहरूको सारांश</h2>';
        
        if (works.length === 0) {
            return '<p>कुनै कार्यहरू छैनन्</p>';
        }
        
        html += '<table>';
        html += '<tr><th>क्र.सं.</th><th>कार्यको नाम</th><th>ठेकेदार</th><th>बोलपत्र रकम</th><th>सम्पन्न मिति</th><th>स्थिति</th></tr>';
        
        works.forEach((work, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${work.workName}</td>
                    <td>${work.contractorName}</td>
                    <td>रु. ${this.formatNumber(work.tenderAmount || 0)}</td>
                    <td>${work.workCompletionDate ? this.formatDisplayDate(work.workCompletionDate) : 'नभएको'}</td>
                    <td>${this.getWorkStatus(work)}</td>
                </tr>
            `;
        });
        
        const totalAmount = works.reduce((sum, work) => sum + (work.tenderAmount || 0), 0);
        html += `<tr class="total-row">
            <td colspan="3">जम्मा</td>
            <td>रु. ${this.formatNumber(totalAmount)}</td>
            <td colspan="2">कुल कार्यहरू: ${works.length}</td>
        </tr>`;
        
        html += '</table>';
        return html;
    }

    exportData() {
        const works = this.getAllWorks();
        
        if (works.length === 0) {
            this.showMessage('निर्यात गर्न को लागि कुनै डाटा छैन', 'error');
            return;
        }
        
        // CSV फरम्याटमा डाटा तयार गर्ने
        let csvContent = 'निर्माण कार्यको नाम,निर्माण कार्यको साइट,बोलपत्र रकम,ठेकेदारको नाम,कार्य सम्पन्न मिति,स्थिति\n';
        
        works.forEach(work => {
            const row = [
                `"${work.workName}"`,
                `"${work.workSite}"`,
                work.tenderAmount || 0,
                `"${work.contractorName}"`,
                work.workCompletionDate || '',
                this.getWorkStatus(work)
            ];
            csvContent += row.join(',') + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `construction-works-${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showMessage('डाटा CSV फाइलमा निर्यात गरियो', 'success');
        
        // गतिविधि लग थप्ने
        auth.logActivity('डाटा CSV मा निर्यात गरियो');
    }

    // सहायक विधिहरू
    getAllWorks() {
        return JSON.parse(localStorage.getItem('constructionWorks') || '[]');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getWorkStatus(work) {
        if (!work.workCompletionDate) {
            return 'upcoming';
        }
        
        const completionDate = new Date(work.workCompletionDate);
        const today = new Date();
        
        if (completionDate < today) {
            return 'completed';
        } else {
            return 'active';
        }
    }

    isWorkExpiring(work) {
        if (!work.workCompletionDate) {
            return false;
        }
        
        const completionDate = new Date(work.workCompletionDate);
        const today = new Date();
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        
        return completionDate >= today && completionDate <= oneMonthLater;
    }

    getStatusClass(status) {
        switch(status) {
            case 'active': return 'active';
            case 'completed': return 'completed';
            case 'upcoming': return 'expiring';
            default: return '';
        }
    }

    determineWorkStatus(workData) {
        if (!workData.workCompletionDate) {
            return 'upcoming';
        }
        
        const completionDate = new Date(workData.workCompletionDate);
        const today = new Date();
        
        if (completionDate < today) {
            return 'completed';
        } else {
            return 'active';
        }
    }

    calculateTotalBillsAmount(bills) {
        if (!bills || !Array.isArray(bills)) {
            return 0;
        }
        
        return bills.reduce((total, bill) => total + (bill.amount || 0), 0);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('ne-NP').format(num);
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDisplayDate(dateString) {
        if (!dateString) return 'नभएको';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'अवैध मिति';
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ne-NP', options);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('form-message');
        if (!messageDiv) return;
        
        messageDiv.textContent = message;
        messageDiv.className = 'message';
        
        if (type) {
            messageDiv.classList.add(type);
        }
        
        // सन्देश स्वचालित रूपमा हटाउने
        if (type) {
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'message';
            }, 5000);
        }
    }

    showPasswordMessage(message, type, messageDiv) {
        if (!messageDiv) return;
        
        messageDiv.textContent = message;
        messageDiv.className = 'message';
        
        if (type) {
            messageDiv.classList.add(type);
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    updateCurrentYear() {
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
        const today = new Date();
        const adStr = this.formatDate(today);
        const adEl = document.getElementById('today-date-ad');
        if (adEl) { adEl.textContent = adStr; }
        const m = today.getMonth() + 1;
        const d = today.getDate();
        const y = today.getFullYear();
        const bsY = m >= 4 ? y + 57 : y + 56;
        const map = {1:10,2:11,3:12,4:1,5:2,6:3,7:4,8:5,9:6,10:7,11:8,12:9};
        const bsM = map[m];
        const bsStr = `${bsY}-${String(bsM).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const bsEl = document.getElementById('today-date-bs');
        if (bsEl) { bsEl.textContent = bsStr; }
    }

    updateStatusChart(works) {
        // यदि चार्ट लाइब्रेरी उपलब्ध छ भने चार्ट अपडेट गर्ने
        // यहाँ साधारण HTML प्रतिनिधित्व मात्र दिइएको छ
        const statusCounts = {
            active: works.filter(w => this.getWorkStatus(w) === 'active').length,
            completed: works.filter(w => this.getWorkStatus(w) === 'completed').length,
            upcoming: works.filter(w => this.getWorkStatus(w) === 'upcoming').length,
            expiring: works.filter(w => this.isWorkExpiring(w)).length
        };
        
        const chartElement = document.getElementById('status-chart');
        if (chartElement) {
            // यहाँ चार्ट जेएस लाइब्रेरी प्रयोग गरेर चार्ट बनाउने
            // अहिलेको लागि साधारण HTML प्रदर्शन मात्र
            chartElement.innerHTML = `
                <div style="display: flex; align-items: flex-end; height: 200px; gap: 20px; padding: 20px;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="background-color: #3498db; width: 40px; height: ${statusCounts.active * 10}px;"></div>
                        <span>सक्रिय (${statusCounts.active})</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="background-color: #27ae60; width: 40px; height: ${statusCounts.completed * 10}px;"></div>
                        <span>सम्पन्न (${statusCounts.completed})</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="background-color: #f39c12; width: 40px; height: ${statusCounts.upcoming * 10}px;"></div>
                        <span>सुरु हुन बाँकी (${statusCounts.upcoming})</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div style="background-color: #e74c3c; width: 40px; height: ${statusCounts.expiring * 10}px;"></div>
                        <span>म्याद नजिकिँदै (${statusCounts.expiring})</span>
                    </div>
                </div>
            `;
        }
    }
}

// एप्लिकेसन सुरु गर्ने
const constructionSystem = new ConstructionManagementSystem();