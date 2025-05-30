import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

interface TranslationSet {
  [key: string]: string;
}

interface Translations {
  arabic: TranslationSet;
  english: TranslationSet;
}

interface ChatMessage {
  text: string;
  sender: 'user' | 'doctor';
}

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Add CommonModule, RouterModule, FormsModule
  templateUrl: './main-page.html',
  styleUrls: ['./main-page.css']
})
export class MainPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @HostBinding('class.ltr') isLtr = false;
  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;

  currentLanguage: 'arabic' | 'english' = 'arabic';
  translations: Translations = {
    arabic: {
      q1: 'س: ما المهارات التي يمكنني اكتسابها من التدريب؟',
      q2: 'س: لماذا يعتبر التدريب مهمًا للطلاب؟',
      q3: 'س: ما هي الفكرة الرئيسية للمشروع؟',
      q4: 'س: ما هو الجدول الزمني للمشروع؟',
      q5: 'س: هل يمكن أن يؤدي التدريب إلى الحصول على عرض عمل؟',
      q6: 'س: ماذا يجب أن أدرج في طلب التدريب الخاص بي؟',
      q7: 'س: كيف يمكنني تحقيق أقصى استفادة من فترة تدريبي؟',
      q8: 'س: ماذا يجب أن أفعل بعد الانتهاء من التدريب؟',
      q9: 'س: كيف أختار موضوع جيد لمشروع تخرجي؟',
      q10: 'س: كيف أضمن جودة مشروعي؟',
      a1: 'ج: التدريبات تساعد في تطوير المهارات التقنية، المعرفة الصناعية، الاتصال، حل المشكلات، العمل الجماعي، إدارة الوقت، وغالبًا ما توفر فهماً عملياً للبيئة المهنية.',
      a2: 'ج: التدريبات توفر تجربة عملية، مما يساعد الطلاب على تطبيق المعرفة النظرية في سيناريوهات العالم الحقيقي. تعزز المهارات التقنية وقد تؤدي إلى عروض عمل.',
      a3: 'ج: الفكرة الرئيسية للمشروع هي تقديم نظرة عامة مفصلة عن المشكلة التي يتم معالجتها، منهج الحل، وأهداف المشروع. يجب أن يوضح الهدف من المشروع ونتائجه المتوقعة.',
      a4: 'ج: الجدول الزمني للمشروع يحدد المعالم الرئيسية والمواعيد النهائية، بما في ذلك تخطيط المشروع، البحث، التطوير، الاختبار، وتواريخ التقديم. يساعد في تتبع التقدم وضمان الإنجاز في الوقت المحدد.',
      a5: 'ج: نعم، تعمل العديد من برامج التدريب المهني كمسار للحصول على وظيفة بدوام كامل. غالبًا ما تقوم الشركات بتوظيف المتدربين ذوي الأداء الأفضل بعد تخرجهم، لأنهم على دراية بثقافة الشركة وعملها.',
      a6: 'ج: يجب أن يتضمن طلب التدريب الخاص بك سيرتك الذاتية المحدثة، وخطاب تقديمي مصمم خصيصًا للمنصب، وأي مستندات داعمة مثل السجلات أو المراجع.',
      a7: 'ج: كن استباقيًا، واطرح الأسئلة، واطلب الملاحظات، وتواصل مع الزملاء والموجهين. اغتنم كل فرصة للتعلم والمساهمة في الفريق.',
      a8: 'ج: بعد الانتهاء من التدريب، تأكد من إرسال رسالة شكر، والتفكير في التجربة، والبقاء على اتصال مع مرشديك وزملائك. يمكن أن يساعدك هذا في بناء علاقات مهنية طويلة الأمد.',
      a9: 'ج: اختر موضوعًا يتماشى مع اهتماماتك ونقاط قوتك وأهدافك المهنية. يجب أن يكون الموضوع ذا صلة وقابلاً للتنفيذ ويسمح بالقدر الكافي من البحث والتطوير.',
      a10: 'ج: ركز على البحث الشامل، وتحليل البيانات بدقة، والكتابة الواضحة، والهيكل المنظم جيدًا. راجع عملك ونقحه بانتظام، واطلب الملاحظات من المشرف الخاص بك.',
      commonQuestionsTitle: 'الأسئلة الشائعة والأجوبة',
      chatHeaderTitle: 'اسأل استاذك',
      chatPlaceholder: 'اكتب رسالتك هنا...',
      chatWelcome: 'مرحبا! كيف يمكنني مساعدتك اليوم؟',
      chatNotification: 'هل لديك أي أسئلة حول التدريب أو مشاريع التخرج؟ أنا هنا لمساعدتك!',
      chatResponseInternship: 'التدريبات وسيلة رائعة لاكتساب خبرة عملية. هل ترغب في مزيد من المعلومات حول برامج التدريب لدينا؟',
      chatResponseProject: 'لدينا موارد تساعدك في مشروع تخرجك. هل تحتاج مساعدة في كتابة الاقتراح، الوثائق، أو التنفيذ؟',
      chatResponseHello: 'مرحبا! كيف يمكنني مساعدتك اليوم فيما يتعلق بالتدريب أو مشاريع التخرج؟',
      chatResponseDefault: 'شكراً لرسالتك. سيتواصل معك أحد أساتذتنا قريباً.',
      footerContent: '© 2023 أنظمة إدارة المشاريع والتدريب الميداني. كل الحقوق محفوظة.'
    },
    english: {
      q1: 'Q: What skills can I gain from an internship?',
      q2: 'Q: Why is an internship important for students?',
      q3: 'Q: What is the main idea of the project?',
      q4: 'Q: What is the project timeline?',
      q5: 'Q: Can an internship lead to a job offer?',
      q6: 'Q: What should I include in my internship application?',
      q7: 'Q: How can I make the most out of my internship?',
      q8: 'Q: What should I do after completing an internship?',
      q9: 'Q: How do I choose a good topic for my graduation project?',
      q10: 'Q: How do I ensure the quality of my project?',
      a1: 'A: Internships help develop technical skills, industry knowledge, communication, problem-solving, teamwork, time management, and often provide a practical understanding of the job environment.',
      a2: 'A: Internships provide hands-on experience, helping students apply theoretical knowledge in real-world scenarios. They enhance technical skills and can lead to job offers.',
      a3: 'A: The main idea of the project is to provide a detailed overview of the problem being addressed, the solution approach, and the project\'s objectives. It should clearly state the purpose of the project and its expected outcome.',
      a4: 'A: The project timeline outlines the major milestones and deadlines, including project planning, research, development, testing, and submission dates. It helps track progress and ensures timely completion.',
      a5: 'A: Yes, many internships serve as a pathway to full-time employment. Companies often hire top-performing interns after they graduate, as they are already familiar with the company\'s culture and work.',
      a6: 'A: Your internship application should include your updated resume, a cover letter tailored to the position, and any supporting documents like transcripts or references.',
      a7: 'A: Be proactive, ask questions, seek feedback, and network with colleagues and mentors. Take every opportunity to learn and contribute to the team.',
      a8: 'A: After completing an internship, be sure to follow up with a thank-you note, reflect on the experience, and stay in touch with your mentors and colleagues. This can help you build long-term professional relationships.',
      a9: 'A: Choose a topic that aligns with your interests, strengths, and career goals. It should be relevant, feasible, and allow for enough research and development.',
      a10: 'A: Focus on thorough research, accurate data analysis, clear writing, and a well-organized structure. Regularly review and revise your work, and seek feedback from your supervisor.',
      commonQuestionsTitle: 'Common Questions & Answers',
      chatHeaderTitle: 'Ask Your Professor',
      chatPlaceholder: 'Type your message here...',
      chatWelcome: 'Hello! How can I help you today?',
      chatNotification: 'Do you have any questions about internships or graduation projects? I\'m here to help!',
      chatResponseInternship: 'Internships are a great way to gain practical experience. Would you like me to provide more information about our internship programs?',
      chatResponseProject: 'We have resources to help with your graduation project. Do you need assistance with proposal writing, documentation, or implementation?',
      chatResponseHello: 'Hello! How can I assist you today with internships or graduation projects?',
      chatResponseDefault: 'Thank you for your message. One of our professors will get back to you shortly.',
      footerContent: '© 2023 Project management systems and field training. All rights reserved.'
    }
  };

  // Properties for data binding in the template
  commonQuestionsTitle = '';
  q1 = ''; a1 = ''; q2 = ''; a2 = ''; q3 = ''; a3 = ''; q4 = ''; a4 = ''; q5 = ''; a5 = '';
  q6 = ''; a6 = ''; q7 = ''; a7 = ''; q8 = ''; a8 = ''; q9 = ''; a9 = ''; q10 = ''; a10 = '';
  footerContent = '';
  chatHeaderTitle = '';
  chatPlaceholder = '';

  isChatOpen = false;
  showNotificationBadge = false;
  messages: ChatMessage[] = [];
  userMessage = '';
  doctorStatus = 'online'; // Example status
  private notificationTimeout: any;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setLanguage(this.currentLanguage); // Set initial language
    this.addMessage(this.translations[this.currentLanguage]['chatWelcome'], 'doctor'); // Use bracket notation

    // Simulate receiving a notification message after 30 seconds
    this.notificationTimeout = setTimeout(() => {
      if (!this.isChatOpen) {
        this.showNotificationBadge = true;
        // Add message to be shown when chat opens
        this.addMessage(this.translations[this.currentLanguage]['chatNotification'], 'doctor', false); // Use bracket notation, don't scroll yet
        this.cdr.detectChanges(); // Trigger change detection for the badge
      }
    }, 30000);
  }

  ngAfterViewInit(): void {
    this.scrollToBottom(); // Scroll down initially if needed
  }

  ngOnDestroy(): void {
    // Clear the timeout when the component is destroyed
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  setLanguage(lang: 'arabic' | 'english'): void {
    this.currentLanguage = lang;
    this.isLtr = lang === 'english';
    const currentTranslations = this.translations[lang];

    // Update all bound properties using bracket notation for safety
    Object.keys(currentTranslations).forEach(key => {
        if (this.hasOwnProperty(key as keyof this)) {
            (this as any)[key] = currentTranslations[key];
        }
    });

    // Update initial chat message if needed
    if (this.messages.length > 0 && this.messages[0].sender === 'doctor') {
       this.messages[0].text = this.translations[this.currentLanguage]['chatWelcome']; // Use bracket notation
    }
    this.cdr.detectChanges(); // Ensure view updates after language change
  }

  logout(): void {
    // Clear token/session (assuming token is stored in cookies as per login component)
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict';
    localStorage.removeItem('token'); // Also remove from localStorage if used
    this.router.navigate(['/login']); // Navigate back to login page (assuming '/login' route exists)
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.showNotificationBadge = false; // Hide badge when chat is opened
      this.cdr.detectChanges(); // Ensure view updates
      this.scrollToBottom(); // Scroll down when opening
    }
  }

  sendMessage(): void {
    const message = this.userMessage.trim();
    if (message !== '') {
      this.addMessage(message, 'user');
      this.userMessage = ''; // Clear input field

      // Simulate doctor response
      setTimeout(() => {
        this.simulateDoctorResponse(message);
      }, 1000);
    }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  addMessage(text: string, sender: 'user' | 'doctor', scrollToBottom = true): void {
    this.messages.push({ text, sender });
    if (scrollToBottom) {
        // Use setTimeout to allow Angular to update the DOM before scrolling
        setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  private scrollToBottom(): void {
    try {
        if (this.chatMessagesContainer) {
             this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
        }
    } catch(err) { console.error('Scroll error:', err); }
  }

  simulateDoctorResponse(userMessage: string): void {
    const lang = this.currentLanguage;
    // Use bracket notation for accessing potentially dynamic keys
    let response = this.translations[lang]['chatResponseDefault'];
    const lowerCaseMessage = userMessage.toLowerCase();

    // Basic keyword matching for responses
    if (lowerCaseMessage.includes('internship') || lowerCaseMessage.includes('تدريب')) {
      response = this.translations[lang]['chatResponseInternship'];
    } else if (lowerCaseMessage.includes('project') || lowerCaseMessage.includes('مشروع')) {
      response = this.translations[lang]['chatResponseProject'];
    } else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi') || lowerCaseMessage.includes('مرحبا')) {
      response = this.translations[lang]['chatResponseHello'];
    }

    this.addMessage(response, 'doctor');
  }
}

