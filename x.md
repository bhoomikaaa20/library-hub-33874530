
# 📘 **PRD: Student Book Return Functionality**

## 🧠 **Context**
Students can currently **borrow books**, and the borrowing activity is correctly tracked.  
However, students do not have a way to **return** books from their interface.

A clear, simple return flow is required.

---

# 🎯 **Goal**
Allow students to **return the books they have borrowed** from a dedicated section, ensuring smooth tracking and accurate book availability.

---

# 👤 **User Story**
**As a student**,  
I want to see a list of books I have borrowed  
and be able to return a book easily  
so that the librarian receives the update and the book becomes available for other students.

---

# 🖼️ **Feature Overview**

### 1. **My Borrowed Books Page**
A dedicated page under the student dashboard that shows:
- Book image  
- Book title  
- Author  
- Borrow date  
- Due date  
- Current status (Borrowed / Returned)
- A **Return Book** button for active borrowings

This page only shows books the student has actually borrowed.

---

### 2. **Return Book Action**
When a student clicks **Return Book**:
- The book is marked as returned  
- The available stock count increases  
- The borrowing activity is logged  
- The book is removed from the “Active Borrowings” section  

---

### 3. **Status Update**
After returning:
- Student sees the book under a **Returned** section or the record disappears from active borrowings  
- Librarian sees the update in the **Borrow Requests / Activity Log**  

---

# 📌 **User Flow**

1. Student signs in  
2. Goes to **My Borrowed Books**  
3. Sees all books currently borrowed  
4. Clicks **Return Book** for a specific book  
5. A confirmation appears  
6. Book is marked as returned  
7. Student no longer sees it as "Borrowed"  
8. Librarian sees the updated status

---

# 🏷️ **Non-Goals**
- No return button in the “All Books” list  
- No manual editing of return details by students  
- No forced upload/notes during return

---

# ✔️ **Acceptance Criteria**

- Students must see all their borrowed books in one place  
- A clear **Return Book** button must be available only for active borrowings  
- Returning a book must update:
  - student’s borrowed list  
  - book availability count  
  - librarian’s activity logs  
- Returned books should not appear in the active borrowed section

---

