(function () {
  const pages = {
    '/tutor/courses/create': {
      area: 'Tutor Studio',
      title: 'Course Creation Wizard',
      summary: 'Plan, price, structure, and publish a course from one guided workspace.',
      score: '4 steps',
      status: 'Draft flow',
      actions: [['Open Builder', '/tutor/courses/builder/new'], ['Assignments', '/tutor/assignments']],
      metrics: [['Outline', 'Required'], ['Pricing', 'Pending'], ['Media', 'Ready'], ['Review', 'Before publish']],
      listTitle: 'Wizard Steps',
      items: [
        ['edit_note', 'Course basics', 'Title, audience, outcomes, category, and cover image.', 'Step 1'],
        ['view_module', 'Curriculum map', 'Modules, lessons, assignments, quizzes, and downloadable resources.', 'Step 2'],
        ['sell', 'Pricing and coupons', 'Set price, enrollment preview, coupons, and launch rules.', 'Step 3'],
        ['published_with_changes', 'Publish review', 'Check completeness, preview landing page, and publish.', 'Step 4'],
      ],
      form: 'course',
      tableTitle: 'Launch Checklist',
      rows: [['Audience', 'Defined learner segment', 'Needed'], ['Assessment', 'At least one graded task', 'Recommended'], ['Certificate', 'Completion rule attached', 'Optional']],
    },
    '/assignments/:id/student/submit': {
      area: 'Learner Workspace',
      title: 'Assignment Submission',
      summary: 'Review requirements, submit written answers, attach files, and track grading status.',
      score: 'Open',
      status: 'Submission portal',
      actions: [['My Grades', '/students/grades'], ['Assignments', '/assignments/demo/student']],
      metrics: [['Attempts', '2 left'], ['Max Upload', '100 MB'], ['Late Policy', 'Visible'], ['Rubric', 'Attached']],
      listTitle: 'Submission Requirements',
      items: [
        ['checklist', 'Answer all prompts', 'Use the text area for structured responses and references.', 'Required'],
        ['upload_file', 'Attach evidence', 'Upload project files, screenshots, PDFs, or source archives.', 'Optional'],
        ['history', 'Confirm attempt', 'Your current attempt remains editable until the deadline.', 'Before submit'],
      ],
      form: 'submission',
      tableTitle: 'Attempt History',
      rows: [['Draft', 'Saved locally', 'Current'], ['Attempt 1', 'Submitted for review', 'Returned'], ['Attempt 2', 'Available', 'Open']],
    },
    '/gradebook/:studentId': {
      area: 'Tutor Gradebook',
      title: 'Student Grade Detail',
      summary: 'See an individual learner profile, assignment outcomes, risk signals, and feedback history.',
      score: '87%',
      status: 'Current average',
      actions: [['All Students', '/tutor/students'], ['Submissions', '/tutor/submissions']],
      metrics: [['Completed', '18'], ['Pending', '3'], ['Missing', '1'], ['Trend', '+6%']],
      listTitle: 'Intervention Queue',
      items: [
        ['priority_high', 'Capstone milestone late', 'Send focused feedback and offer an office-hour slot.', 'High'],
        ['trending_up', 'Quiz scores improving', 'Recent attempts show stronger retention.', 'Positive'],
        ['forum', 'Discussion participation low', 'Recommend a study group thread.', 'Watch'],
      ],
      form: 'feedback',
      tableTitle: 'Grade Items',
      rows: [['Data Modeling Lab', '92%', 'Graded'], ['API Security Review', '84%', 'Returned'], ['Capstone Proposal', '-', 'Pending']],
    },
    '/certificate/download/:certId': {
      area: 'Certificates',
      title: 'Certificate Download',
      summary: 'Verify certificate ownership, download the PDF, export a badge, or share a verification link.',
      score: 'Verified',
      status: 'Credential page',
      actions: [['Verify Certificate', '/certificate/verify'], ['My Certificates', '/students/certificates']],
      metrics: [['Format', 'PDF'], ['Badge', 'PNG'], ['Public Link', 'Enabled'], ['Revocation', 'Checked']],
      listTitle: 'Available Actions',
      items: [
        ['download', 'Download certificate', 'Fetches the signed certificate file from the API download endpoint.', 'Primary'],
        ['badge', 'Download badge', 'Exports a compact badge suitable for portfolios.', 'Share'],
        ['link', 'Copy verification link', 'Use public verification for employers and reviewers.', 'Public'],
      ],
      tableTitle: 'Audit Trail',
      rows: [['Issued', 'Course completion passed', 'System'], ['Verified', 'Signature and certificate id matched', 'Public'], ['Downloaded', 'Current session requested export', 'User']],
    },
    '/certificates/download/:certId/page': {
      area: 'Certificates',
      title: 'Certificate Download',
      summary: 'Verify certificate ownership, download the PDF, export a badge, or share a verification link.',
      score: 'Verified',
      status: 'Credential page',
      actions: [['Verify Certificate', '/certificate/verify'], ['My Certificates', '/students/certificates']],
      metrics: [['Format', 'PDF'], ['Badge', 'PNG'], ['Public Link', 'Enabled'], ['Revocation', 'Checked']],
      listTitle: 'Available Actions',
      items: [
        ['download', 'Download certificate', 'Fetches the signed certificate file from the API download endpoint.', 'Primary'],
        ['badge', 'Download badge', 'Exports a compact badge suitable for portfolios.', 'Share'],
        ['link', 'Copy verification link', 'Use public verification for employers and reviewers.', 'Public'],
      ],
      tableTitle: 'Audit Trail',
      rows: [['Issued', 'Course completion passed', 'System'], ['Verified', 'Signature and certificate id matched', 'Public'], ['Downloaded', 'Current session requested export', 'User']],
    },
    '/admin/emails/templates': adminPage('Email Templates Admin', 'Manage transactional, assessment, course, billing, and support email templates.', '12 templates', [['Auth', '5'], ['Course', '4'], ['Billing', '3'], ['Misc', '6']]),
    '/admin/system/logs': adminPage('System Logs', 'Monitor application events, error traces, background jobs, and integration status.', 'Live', [['Errors', '2'], ['Jobs', '18'], ['Webhooks', '7'], ['Redis', 'Optional']]),
    '/admin/users/:id/activity': adminPage('User Activity Log', 'Inspect sign-ins, profile edits, enrollment events, support actions, and security-sensitive changes.', '48 events', [['Logins', '14'], ['Learning', '21'], ['Billing', '3'], ['Admin', '10']]),
    '/mentorship/applications': adminPage('Mentorship Applications', 'Review mentor applications, match students to programs, and approve or reject requests.', '9 pending', [['Pending', '9'], ['Approved', '31'], ['Rejected', '4'], ['Programs', '6']]),
    '/billing/history': billingPage('Billing History', 'Review subscriptions, invoices, refunds, and course purchases from one place.', '3 invoices'),
    '/billing/payment-methods': billingPage('Payment Methods', 'Manage saved cards, default payment methods, billing contacts, and checkout readiness.', '1 active'),
    '/admin/reports/export': adminPage('Reports Export', 'Build CSV exports for reports, warnings, users, courses, revenue, and support queues.', 'CSV ready', [['Reports', '24'], ['Warnings', '8'], ['Users', '1.2k'], ['Revenue', '$48k']]),
    '/tutor/earnings/:period': {
      area: 'Tutor Finance',
      title: 'Earnings Detail',
      summary: 'Break down revenue by period, course, payout status, refunds, and platform fees.',
      score: '$4.8k',
      status: 'Selected period',
      actions: [['Earnings', '/tutor/earnings'], ['Analytics', '/tutor/analytics']],
      metrics: [['Gross', '$5.4k'], ['Fees', '$620'], ['Payouts', '$3.9k'], ['Pending', '$900']],
      listTitle: 'Revenue Drivers',
      items: [
        ['school', 'Cloud Security Foundations', '42 enrollments this period.', '$2.1k'],
        ['groups', 'Team cohort seats', 'Corporate bundle for 18 learners.', '$1.6k'],
        ['card_membership', 'Mentorship add-ons', 'Recurring mentor sessions.', '$1.1k'],
      ],
      tableTitle: 'Payout Ledger',
      rows: [['Jul 12', '$1,250', 'Paid'], ['Jul 19', '$1,480', 'Paid'], ['Jul 26', '$910', 'Pending']],
    },
    '/learning-paths/:id': publicDetail('Learning Path Detail', 'A sequenced plan with milestones, courses, projects, and checkpoint assessments.', '8 weeks'),
    '/certifications/:id': publicDetail('Certification Detail', 'Credential requirements, exam coverage, preparation plan, and renewal information.', 'Pro level'),
    '/corporate-training/:id': publicDetail('Corporate Training Detail', 'Team training package details, cohort setup, reporting, and implementation timeline.', 'Team plan'),
    '/privacy/manage': publicDetail('Privacy Policy Management', 'Admin-managed policy blocks for notices, retention rules, subprocessors, and export requests.', 'Governance'),
    '/terms/manage': publicDetail('Terms Management', 'Admin-managed service terms, policy revisions, user notices, and acceptance tracking.', 'Governance'),
    '/students/study-planner': {
      area: 'Learner Workspace',
      title: 'Study Planner',
      summary: 'Turn course deadlines, weekly goals, and available study windows into a focused plan.',
      score: '5 blocks',
      status: 'This week',
      actions: [['Progress', '/students/progress'], ['Calendar', '/tutor/calendar']],
      metrics: [['Focus Time', '7h'], ['Deadlines', '3'], ['Streak', '6 days'], ['Risk', 'Low']],
      listTitle: 'Planned Blocks',
      items: [
        ['today', 'Today: API Security', 'Read lesson, complete quiz, write notes.', '90 min'],
        ['event', 'Wednesday: Project work', 'Finish data model and upload draft.', '2 hr'],
        ['groups', 'Friday: Peer review', 'Review two submissions in the study group.', '45 min'],
      ],
      tableTitle: 'Course Load',
      rows: [['Backend Security', 'On track', '3 tasks'], ['Data Systems', 'At risk', '1 late'], ['Career Sprint', 'Ahead', '2 tasks']],
    },
    '/admin/compliance': adminPage('Compliance Center', 'Track policy acceptance, data exports, retention queues, and security contact readiness.', '92%', [['Policies', '4'], ['Exports', '2'], ['Deletion', '1'], ['Security.txt', 'Needs URL']]),
    '/tutor/course-insights': publicDetail('Course Insights', 'Compare engagement, reviews, assignments, completion rates, and content gaps across tutor courses.', 'Insights'),
  };

  function adminPage(title, summary, score, metrics) {
    return {
      area: 'Admin Operations',
      title,
      summary,
      score,
      status: 'Operational page',
      actions: [['Admin Dashboard', '/admin'], ['System', '/admin/system']],
      metrics,
      listTitle: 'Operator Tasks',
      items: [
        ['filter_alt', 'Filter records', 'Narrow by date, status, owner, role, or course.', 'Ready'],
        ['download', 'Export data', 'Prepare operational exports for offline review.', 'CSV'],
        ['fact_check', 'Review exceptions', 'Escalate unresolved, failed, or risky items.', 'Review'],
      ],
      form: 'admin',
      tableTitle: 'Recent Records',
      rows: [['Newest item', 'Awaiting review', 'Open'], ['Processed item', 'Updated by admin', 'Done'], ['Exception', 'Needs follow-up', 'Flagged']],
    };
  }

  function billingPage(title, summary, score) {
    return {
      area: 'Billing',
      title,
      summary,
      score,
      status: 'Account finance',
      actions: [['Checkout', '/checkout'], ['Support', '/support']],
      metrics: [['Plan', 'Pro'], ['Renewal', 'Aug 26'], ['Balance', '$0'], ['Status', 'Active']],
      listTitle: 'Billing Tasks',
      items: [
        ['receipt_long', 'Download invoice', 'Keep purchase receipts and tax records.', 'PDF'],
        ['credit_card', 'Set default method', 'Choose the payment method used for renewals.', 'Card'],
        ['support_agent', 'Request help', 'Open a billing support ticket when payment fails.', 'Support'],
      ],
      form: 'billing',
      tableTitle: 'Billing Records',
      rows: [['LB-2026-0712', 'Professional plan', 'Paid'], ['LB-2026-0626', 'Course purchase', 'Paid'], ['LB-2026-0526', 'Monthly renewal', 'Paid']],
    };
  }

  function publicDetail(title, summary, score) {
    return {
      area: 'Catalog Detail',
      title,
      summary,
      score,
      status: 'Detail page',
      actions: [['Browse Courses', '/courses'], ['Contact', '/contact']],
      metrics: [['Level', 'Mixed'], ['Projects', '4'], ['Mentors', 'Available'], ['Certificate', 'Included']],
      listTitle: 'What This Page Covers',
      items: [
        ['route', 'Structured overview', 'Audience, outcomes, timeline, and requirements.', 'Overview'],
        ['school', 'Connected learning', 'Related courses, milestones, projects, and assessments.', 'Learning'],
        ['contact_support', 'Guided next step', 'Enrollment, enterprise inquiry, or recommendation path.', 'Action'],
      ],
      tableTitle: 'Program Snapshot',
      rows: [['Duration', 'Flexible schedule', 'Self paced'], ['Assessment', 'Project and quiz based', 'Included'], ['Support', 'Mentor and community access', 'Available']],
    };
  }

  function matchPage(pathname) {
    if (pages[pathname]) return pages[pathname];
    const patterns = Object.keys(pages).filter((key) => key.includes(':'));
    return pages[patterns.find((pattern) => {
      const re = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
      return re.test(pathname);
    })] || publicDetail('Workspace', 'This route is ready for a dedicated LearnBridge workflow.', 'Ready');
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function link(label, href, className) {
    const a = document.createElement('a');
    a.href = href;
    a.className = className;
    a.textContent = label;
    return a;
  }

  function render() {
    const config = matchPage(window.location.pathname);
    document.title = `${config.title} - LearnBridge`;
    setText('workspace-area', config.area);
    setText('workspace-title', config.title);
    setText('workspace-summary', config.summary);
    setText('workspace-score', config.score);
    setText('workspace-status', config.status);
    setText('workspace-list-title', config.listTitle);
    setText('workspace-table-title', config.tableTitle);

    const actions = document.getElementById('workspace-actions');
    config.actions.forEach(([label, href], index) => actions.appendChild(link(label, href, index === 0 ? 'btn-primary' : 'btn-secondary')));

    const metrics = document.getElementById('workspace-metrics');
    config.metrics.forEach(([label, value]) => {
      const card = document.createElement('div');
      card.className = 'workspace-metric';
      const strong = document.createElement('span');
      strong.className = 'value';
      strong.textContent = value;
      const small = document.createElement('span');
      small.className = 'label';
      small.textContent = label;
      card.append(strong, small);
      metrics.appendChild(card);
    });

    const list = document.getElementById('workspace-list');
    config.items.forEach(([icon, title, meta, pill]) => {
      const item = document.createElement('div');
      item.className = 'workspace-item';
      const iconEl = document.createElement('span');
      iconEl.className = 'workspace-icon material-symbols-outlined';
      iconEl.textContent = icon;
      const body = document.createElement('div');
      const h = document.createElement('div');
      h.className = 'workspace-item-title';
      h.textContent = title;
      const p = document.createElement('div');
      p.className = 'workspace-item-meta';
      p.textContent = meta;
      body.append(h, p);
      const badge = document.createElement('span');
      badge.className = 'workspace-pill';
      badge.textContent = pill;
      item.append(iconEl, body, badge);
      list.appendChild(item);
    });

    const tbody = document.getElementById('workspace-table-body');
    config.rows.forEach((row) => {
      const tr = document.createElement('tr');
      row.forEach((cell, idx) => {
        const td = document.createElement('td');
        td.textContent = cell;
        if (idx === 2) {
          const pill = document.createElement('span');
          pill.className = 'workspace-pill';
          pill.textContent = cell;
          td.textContent = '';
          td.appendChild(pill);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    renderForm(config.form);
  }

  function renderForm(type) {
    const form = document.getElementById('workspace-form');
    const fields = {
      course: [['Course title', 'input'], ['Primary audience', 'input'], ['Learning outcomes', 'textarea']],
      submission: [['Submission notes', 'textarea'], ['Repository or document link', 'input'], ['Submission status', 'select']],
      feedback: [['Feedback summary', 'textarea'], ['Recommended next step', 'input'], ['Risk level', 'select']],
      admin: [['Search or filter', 'input'], ['Owner', 'input'], ['Action note', 'textarea']],
      billing: [['Billing contact', 'input'], ['Reference number', 'input'], ['Support note', 'textarea']],
    }[type] || [['Page note', 'textarea'], ['Owner', 'input'], ['Status', 'select']];

    fields.forEach(([label, kind]) => {
      const field = document.createElement('div');
      field.className = 'workspace-field';
      const labelEl = document.createElement('label');
      labelEl.textContent = label;
      let input;
      if (kind === 'textarea') {
        input = document.createElement('textarea');
      } else if (kind === 'select') {
        input = document.createElement('select');
        ['Draft', 'Ready', 'Needs review'].forEach((value) => {
          const option = document.createElement('option');
          option.textContent = value;
          input.appendChild(option);
        });
      } else {
        input = document.createElement('input');
        input.type = 'text';
      }
      field.append(labelEl, input);
      form.appendChild(field);
    });

    const button = document.createElement('button');
    button.className = 'btn-primary';
    button.type = 'button';
    button.textContent = 'Save draft';
    button.addEventListener('click', () => {
      const notice = document.getElementById('workspace-notice');
      notice.textContent = 'Draft saved in this session. Connect this page to its API endpoint when the backend workflow is ready.';
      notice.hidden = false;
    });
    form.appendChild(button);
  }

  document.addEventListener('DOMContentLoaded', render);
})();
