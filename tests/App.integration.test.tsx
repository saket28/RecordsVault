import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { describe, it, expect, vi } from 'vitest';

// We get the mocked function from the global scope, as it's mocked in setup.ts
const createObjectURLMock = vi.mocked(URL.createObjectURL);

describe('RecordVault Full User Journey', () => {

  it('allows a user to create a vault, manage data, generate a report, and log out/in', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // --- 1. Registration ---
    expect(screen.getByRole('heading', { name: /RecordVault/i, level: 1 })).toBeInTheDocument();
    
    const nameInput = screen.getByLabelText(/Your Name/i);
    const passwordInput = screen.getByLabelText(/Vault Password/i);
    const openVaultButton = screen.getByRole('button', { name: /Open My Vault/i });

    await user.type(nameInput, 'Test User');
    await user.type(passwordInput, 'password123');
    await user.click(openVaultButton);
    
    // --- 2. Main Dashboard & Default Categories ---
    // Wait for the main app UI to render after login
    const sidebar = await screen.findByRole('complementary');
    expect(within(sidebar).getByRole('heading', { name: /RecordVault/i })).toBeInTheDocument();

    const defaultCategories = [
      'Personal IDs', 'Bank Accounts', 'Brokerage Accounts', 
      'Retirement/Pension Accounts', 'Loans', 'Insurance Policies', 'Properties', 'Valuables'
    ];
    for (const categoryName of defaultCategories) {
        expect(within(sidebar).getByText(categoryName)).toBeInTheDocument();
    }
    
    // --- 3. Add a new Category ---
    const addCategoryButton = within(sidebar).getByRole('button', { name: /Add new category/i });
    await user.click(addCategoryButton);

    const categoryModal = await screen.findByRole('dialog');
    expect(within(categoryModal).getByRole('heading', { name: /Add New Category/i })).toBeInTheDocument();
    const categoryNameInput = within(categoryModal).getByLabelText(/Category Name/i);
    const saveCategoryButton = within(categoryModal).getByRole('button', { name: /Save Category/i });

    await user.type(categoryNameInput, 'Hobbies');
    await user.click(saveCategoryButton);

    await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(within(sidebar).getByText('Hobbies')).toBeInTheDocument();
    
    // --- 4. Select a category and add a record ---
    const bankAccountsCategory = within(sidebar).getByText(/Bank Accounts/i);
    await user.click(bankAccountsCategory);

    const mainContent = screen.getByRole('main');
    await waitFor(() => {
        expect(within(mainContent).getByRole('heading', { name: /Bank Accounts/i })).toBeInTheDocument();
    });
    
    const addRecordButton = within(mainContent).getByRole('button', { name: /Add Record/i });
    await user.click(addRecordButton);
    
    const recordModal = await screen.findByRole('dialog');
    expect(within(recordModal).getByRole('heading', { name: /Add New Record/i })).toBeInTheDocument();
    
    // Fill out the record form
    await user.type(within(recordModal).getByLabelText(/Contact Information/i), '555-1234');
    await user.type(within(recordModal).getByLabelText(/Institute Name/i), 'First National Bank');
    await user.type(within(recordModal).getByLabelText(/Account Name/i), 'Savings');
    await user.type(within(recordModal).getByLabelText(/Account Owner/i), 'Self');
    await user.type(within(recordModal).getByLabelText(/ID Number/i), '123456789');

    // Check that record name is auto-generated, required, and grayed out
    const recordKeyInput = within(recordModal).getByLabelText(/Record Name/i);
    expect(recordKeyInput).toHaveValue('First National Bank - Savings - Self');
    expect(recordKeyInput).toBeDisabled();
    // Changing fields updates record name
    await user.clear(within(recordModal).getByLabelText(/Account Owner/i));
    await user.type(within(recordModal).getByLabelText(/Account Owner/i), 'Jon Doe');
    expect(recordKeyInput).toHaveValue('First National Bank - Savings - Jon Doe');

    const saveRecordButton = within(recordModal).getByRole('button', { name: /Save Record/i });
    await user.click(saveRecordButton);

    // Verify record is added
    await waitFor(() => {
        expect(within(mainContent).getByRole('heading', { name: /First National Bank - Savings - Jon Doe/i })).toBeInTheDocument();
    });
    expect(within(mainContent).getByText('555-1234')).toBeInTheDocument();
    expect(within(mainContent).getByText('First National Bank')).toBeInTheDocument();

    // --- 5. Edit a record ---
    const recordCard = within(mainContent).getByText('First National Bank - Savings - Jon Doe').closest('div[class*="bg-white"]');
    const editButton = within(recordCard! as HTMLElement).getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    const editRecordModal = await screen.findByRole('dialog');
    expect(within(editRecordModal).getByRole('heading', { name: /Edit Record/i })).toBeInTheDocument();
    const locationInput = within(editRecordModal).getByLabelText(/^Location$/i);
    await user.clear(locationInput);
    await user.type(locationInput, 'Bank Locker');
    
    await user.click(within(editRecordModal).getByRole('button', { name: /Save Record/i }));
    
    await waitFor(() => {
        expect(within(mainContent).getByText('Bank Locker')).toBeInTheDocument();
    });

    // --- 5a. Change view mode ---
    const viewCardButton = within(mainContent).getByRole('button', { name: /Switch to card view/i });
    await user.click(viewCardButton);
    
    await waitFor(() => {
      const listContainer = within(mainContent).getByText('First National Bank - Savings - Jon Doe').closest('div[class*="grid"]');
      expect(listContainer as HTMLElement).toHaveClass('grid-cols-1'); // Simplified check for card/detail view
    });

    const viewListButton = within(mainContent).getByRole('button', { name: /Switch to list view/i });
    await user.click(viewListButton);

    await waitFor(() => {
      const listContainer = within(mainContent).getByText('First National Bank - Savings - Jon Doe').closest('div[class*="flex flex-col"]');
      expect(listContainer).toBeInTheDocument();
    });

    // --- 6. Disable a category ---
    const disableButton = within(sidebar).getByRole('button', {name: /Disable category Personal IDs/i});
    await user.click(disableButton);
    const personalIdsCategoryItem = within(sidebar).getByText('Personal IDs').closest('div.group');

    await waitFor(() => {
        expect(personalIdsCategoryItem).toHaveClass('opacity-50');
    });

    // --- 7. Generate Report ---
    const generateReportButton = within(sidebar).getByRole('button', {name: /Generate Report/i});
    await user.click(generateReportButton);

    // Verify file download was triggered
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    
    // Fix TypeScript type for globalThis.lastBlobContent
    const lastBlobContent: string | string[] | undefined = (globalThis as any).lastBlobContent;
    const reportContent = Array.isArray(lastBlobContent)
      ? lastBlobContent.join('')
      : String(lastBlobContent);
    
    // Check report content
    expect(reportContent).toContain('## Bank Accounts');
    expect(reportContent).toContain('### First National Bank - Savings - Jon Doe');
    expect(reportContent).not.toContain('## Personal IDs'); // Disabled category should be excluded
    // Empty categories should be skipped in the report
    expect(reportContent).not.toMatch(/_No records in this category._/);
    // Should not include any category section for empty categories
    defaultCategories.forEach(cat => {
      if (cat !== 'Bank Accounts' && cat !== 'Hobbies') {
        expect(reportContent).not.toContain(`## ${cat}`);
      }
    });


    // --- 8. Delete a record ---
    const recordToDeleteCard = within(mainContent).getByText('First National Bank - Savings - Jon Doe').closest('div[class*="bg-white"]');
    const deleteButton = within(recordToDeleteCard! as HTMLElement).getByRole('button', { name: /Delete/i });
    await user.click(deleteButton);

    const confirmModal = await screen.findByRole('dialog');
    expect(within(confirmModal).getByRole('heading', {name: /Delete record/i})).toBeInTheDocument();
    await user.click(within(confirmModal).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
        expect(screen.queryByText('First National Bank - Savings - Jon Doe')).not.toBeInTheDocument();
        expect(within(mainContent).getByText(/No records yet/i)).toBeInTheDocument();
    });

    // --- 9. Logout ---
    await user.click(within(sidebar).getByRole('button', { name: /Sign Out & Lock Vault/i }));

    await waitFor(() => {
        expect(screen.getByLabelText(/Your Name/i)).toBeInTheDocument();
    });

    // --- 10. Login ---
    const nameInputAgain = screen.getByLabelText(/Your Name/i);
    const passwordInputAgain = screen.getByLabelText(/Vault Password/i);
    
    await user.type(nameInputAgain, 'Test User');
    await user.type(passwordInputAgain, 'password123');
    await user.click(screen.getByRole('button', { name: /Open My Vault/i }));

    // Verify data persistence
    const sidebarAgain = await screen.findByRole('complementary');
    await waitFor(() => {
        expect(within(sidebarAgain).getByText('Hobbies')).toBeInTheDocument(); // custom category
        const personalIdsText = within(sidebarAgain).getByText('Personal IDs');
        const personalIdsGroup = personalIdsText.closest('div.group');
        expect(personalIdsGroup).toHaveClass('opacity-50'); // disabled state
    });
  }, 20000);
});