import ProductsNavbar from "@/components/products-navbar";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProductsNavbar />
      {children}
    </>
  );
}
