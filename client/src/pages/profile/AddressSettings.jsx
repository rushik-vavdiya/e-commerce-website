import AddressBook from '../../components/profile/AddressBook';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';

// /account/addresses — saved shipping addresses. Checkout reads the same list
// through GET /addresses, so a customer only has to save an address once.
export default function AddressSettings() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Account"
        title="Addresses"
        description="Save the addresses you order to. The default address is offered first at checkout."
      />

      <AddressBook />
    </div>
  );
}
