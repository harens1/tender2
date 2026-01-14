// स्वचालित गणना प्रणाली
class CalculationSystem {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // कार्य सम्पन्न मितिमा परिवर्तन भएमा
        const completionDateInput = document.getElementById('work-completion-date');
        if (completionDateInput) {
            completionDateInput.addEventListener('change', () => this.calculateWorkGuaranteeDate());
        }

        // जमानत मितिहरूको गणना
        const workGuaranteeFrom = document.getElementById('work-guarantee-from');
        if (workGuaranteeFrom) {
            workGuaranteeFrom.addEventListener('change', () => this.calculateWorkGuaranteeDate());
        }

        // म्याद थप अवधिमा परिवर्तन भएमा
        const extensionPeriod = document.getElementById('extension-period');
        if (extensionPeriod) {
            extensionPeriod.addEventListener('input', () => this.calculateExtensionDates());
        }
    }

    calculateWorkGuaranteeDate() {
        const completionDateInput = document.getElementById('work-completion-date');
        const guaranteeFromInput = document.getElementById('work-guarantee-from');
        const guaranteeToInput = document.getElementById('work-guarantee-to');
        
        if (!completionDateInput || !guaranteeToInput) return;
        
        const completionDate = new Date(completionDateInput.value);
        if (isNaN(completionDate.getTime())) return;
        
        // कार्य सम्पादन जमानतको मिति (कार्य सम्पन्न मितिको १३ महिना थपिएको)
        const guaranteeEndDate = new Date(completionDate);
        guaranteeEndDate.setMonth(guaranteeEndDate.getMonth() + 13);
        
        // मिति फरम्याट गर्ने
        const formattedDate = this.formatDate(guaranteeEndDate);
        guaranteeToInput.value = formattedDate;
        
        // यदि शुरुको मिति भएको छैन भने आजको मिति राख्ने
        if (guaranteeFromInput && !guaranteeFromInput.value) {
            guaranteeFromInput.value = this.formatDate(new Date());
        }
        
        // बिमा अवधि पनि गणना गर्ने
        this.calculateInsuranceExtension();
    }

    calculateExtensionDates() {
        const extensionPeriodInput = document.getElementById('extension-period');
        const extensionFinalDateInput = document.getElementById('extension-final-date');
        const workGuaranteeToInput = document.getElementById('work-guarantee-to');
        
        if (!extensionPeriodInput || !extensionFinalDateInput || !workGuaranteeToInput) return;
        
        const extensionDays = parseInt(extensionPeriodInput.value) || 0;
        const guaranteeEndDate = new Date(workGuaranteeToInput.value);
        
        if (isNaN(guaranteeEndDate.getTime())) return;
        
        // म्याद थप गरेपछि को अन्तिम मिति
        const finalDate = new Date(guaranteeEndDate);
        finalDate.setDate(finalDate.getDate() + extensionDays);
        
        extensionFinalDateInput.value = this.formatDate(finalDate);
        
        // बिमा अवधि पनि गणना गर्ने
        this.calculateInsuranceExtension();
    }

    calculateInsuranceExtension() {
        const insuranceFromInput = document.getElementById('insurance-from');
        const insuranceExtensionInput = document.getElementById('insurance-extension');
        const extensionFinalDateInput = document.getElementById('extension-final-date');
        
        if (!insuranceExtensionInput || !extensionFinalDateInput) return;
        
        const finalDate = new Date(extensionFinalDateInput.value);
        if (isNaN(finalDate.getTime())) return;
        
        // बिमा अवधि (थप अवधि जोडेर)
        insuranceExtensionInput.value = this.formatDate(finalDate);
        
        // यदि बिमा शुरुको मिति भएको छैन भने आजको मिति राख्ने
        if (insuranceFromInput && !insuranceFromInput.value) {
            insuranceFromInput.value = this.formatDate(new Date());
        }
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // नोटिफिकेसनहरूको गणना
    checkExpiringDates(daysAhead = 30) {
        const works = this.getAllWorks();
        const notifications = [];
        const today = new Date();
        
        works.forEach(work => {
            if (!work.workCompletionDate) return;
            
            const completionDate = new Date(work.workCompletionDate);
            const startWindow = new Date(completionDate);
            startWindow.setDate(startWindow.getDate() - (parseInt(daysAhead) || 30));
            
            if (today >= startWindow && today <= completionDate) {
                notifications.push({
                    type: 'warning',
                    title: 'कार्य सम्पन्न हुन लाग्यो',
                    message: `"${work.workName}" को म्याद ${this.formatDate(completionDate)} मा समाप्त हुन लाग्यो।`,
                    workId: work.id,
                    date: new Date().toISOString()
                });
            }
            
            // जमानत मितिहरू पनि जाँच गर्ने
            this.checkGuaranteeDates(work, notifications, daysAhead);
        });
        
        return notifications;
    }

    checkGuaranteeDates(work, notifications, daysAhead = 30) {
        const today = new Date();
        
        // कार्य सम्पादन जमानत
        if (work.workGuaranteeTo) {
            const guaranteeEndDate = new Date(work.workGuaranteeTo);
            const startWindow = new Date(guaranteeEndDate);
            startWindow.setDate(startWindow.getDate() - (parseInt(daysAhead) || 30));
            
            if (today >= startWindow && today <= guaranteeEndDate) {
                notifications.push({
                    type: 'warning',
                    title: 'जमानत म्याद समाप्त हुन लाग्यो',
                    message: `"${work.workName}" को कार्य सम्पादन जमानत ${this.formatDate(guaranteeEndDate)} मा समाप्त हुन लाग्यो।`,
                    workId: work.id,
                    date: new Date().toISOString()
                });
            }
        }
        
        // अन्य जमानतहरूको लागि पनि यस्तै जाँच गर्ने
    }

    getAllWorks() {
        return JSON.parse(localStorage.getItem('constructionWorks') || '[]');
    }
}

// गणना प्रणाली सुरु गर्ने
const calculations = new CalculationSystem();