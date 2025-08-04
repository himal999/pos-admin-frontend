"use client";
import {
  ChevronDown,
  ChevronUp,
  CircleCheckBig,
  CircleX,
  Delete,
  Edit,
  Eye,
  FilePenLine,
  House,
  Save,
  ScanEye,
  ScanSearch,
  Trash2,
  User,
  UserPlus,
  View,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { getSessionData } from "@/utils/session";
import { postLoginRequest } from "@/services/api.service";
import {
  IAddCategory,
  IAddGRN,
  IAddItem,
  ICartGRNItem,
  IGRNFilter,
  IGRNItem,
  IViewGRNItem,
} from "@/types";
import {
  ADD,
  DELETE,
  FILTERLIST,
  ITEMSEQUENCE,
  REFDATA,
  UPDATE,
  VIEW,
} from "@/utils/apiMessage";
import { showErrorAlert, showSuccessAlert } from "@/utils/alert";
import withAuth from "@/utils/withAuth";
import { Search, PlusCircle, FolderPlus } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function NewGRN() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [grnList, setGRNList] = useState<IGRNItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [size] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [selectedGRN, setSelectedGRN] = useState<any>(null);

  const [selectedViewGRN, setSelectedViewGRN] = useState<IViewGRNItem[]>([]);

  const [editModalVisible, setEditModalVisible] = useState(false);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  const [cartItems, setCartItems] = useState<ICartGRNItem[]>([]);
  const [modalItem, setModalItem] = useState<any>({
    itemCode: "",
    description: "",
    lablePrice: "",
    cost: "",
    salePrice: "",
    wholesalePrice: "",
    customerDiscount: "",
    wholesaleDiscount: "",
    qty: "",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Section filter state

  const [viewGRN, setViewGRN] = useState<IGRNFilter>({
    page: 0,
    size: size,
    sortColumn: "lastModifiedDate",
    sortDirection: "DESC",
    search: {
      keyword: "",
    },
  });

  // Direct pdf download generation state
  const handleDirectDownloadPDF = async () => {
    const element = document.getElementById("invoice-content");
    if (!element) return;

    // Backup original styles
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;

    try {
      // Expand content to show full height
      element.style.height = "auto";
      element.style.overflow = "visible";

      // Give time for layout to apply
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        ignoreElements: (el) => el.classList.contains("no-pdf"),
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TransferInvoice_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      // Restore original styles
      element.style.height = originalHeight;
      element.style.overflow = originalOverflow;
    }
  };

  // Privileges and defaultStatus state
  const [privileges, setPrivileges] = useState({
    add: false,
    update: false,
    view: false,
    search: false,
    delete: false,
    userRolePrivilegeAssign: false,
  });

  const [defaultStatus, setDefaultStatus] = useState<
    { code: string; description: string }[]
  >([]);

  const [suppliers, setSuppliers] = useState<
    { code: string; description: string }[]
  >([]);

  const [locations, setLocations] = useState<
    { code: string; description: string }[]
  >([]);

  // Item reference data state
  const [showRegisterItemModal, setShowRegisterItemModal] = useState(false);
  const [newItem, setNewItem] = useState<IAddItem>({
    code: "",
    description: "",
    status: "",
    category: "",
    brand: "",
    unit: "",
  });

  const [brands, setBrands] = useState<{ code: string; description: string }[]>(
    [],
  );

  const [categories, setCategories] = useState<
    { code: string; description: string }[]
  >([]);

  const [units, setUnits] = useState<{ code: string; description: string }[]>(
    [],
  );

  // Category and brand state

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState<IAddCategory>({
    code: "",
    description: "",
    status: "ACTIVE",
  });
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCategory((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Load item code
  const fetchItemCodeSequence = async (): Promise<string | null> => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";

      const response = await postLoginRequest(
        "api/v1/item/item-sequence",
        {},
        ITEMSEQUENCE,
        token,
        username,
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        showErrorAlert(
          "Item Code Fetch Failed",
          response.message || "Failed to fetch item sequence",
        );
        return null;
      }
    } catch (error) {
      console.error("Item code sequence fetch error:", error);
      return null;
    }
  };

  const handleOpenAddModal = async () => {
    const itemCode = await fetchItemCodeSequence();

    if (itemCode) {
      setNewItem({
        code: itemCode,
        description: "",
        status: "ACTIVE",
        category: "",
        brand: "",
        unit: "",
      });
      setShowRegisterItemModal(true);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getSessionData("accessToken") || "";
      const userProfile = getSessionData("userProfile");
      const response = await postLoginRequest(
        "api/v1/item-category/add",
        {
          ...newCategory,
        },
        ADD,
        token,
        userProfile?.username,
      );

      if (response.success) {
        showSuccessAlert(
          "Success",
          response.message || "Category created successfully",
        );
        setShowCategoryModal(false);
        // Reset form fields
        setNewCategory({
          code: "",
          description: "",
          status: "",
        });
      } else {
        showErrorAlert(
          "Category Create Failed",
          response.message || "Something went wrong!",
        );
      }
    } catch (err) {
      console.error("Error calling API:", err);
    } finally {
      setLoading(false);
    }
  };

  const [newGRN, setNewGRN] = useState<IAddGRN>({
    supplierId: "",
    locationCode: "LOC_1",
    cost: 0,
    debitAmount: 0,
    creditAmount: 0,
    remark: "",
    dueDate: "",
    grnDate: "",
    itemGRNS: [
      {
        description: "",
        itemCode: "",
        lablePrice: 0,
        itemCost: 0,
        retailPrice: 0,
        wholesalePrice: 0,
        retailDiscount: 0,
        wholesaleDiscount: 0,
        qty: 0,
        status: "ACTIVE",
      },
    ],
  });

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setModalItem((prev: any) => ({
      ...prev,

      [name]: value === "" ? "" : Number(value),
    }));
  };

  const handleAddOrEditItem = (e: React.FormEvent) => {
    e.preventDefault(); // prevent default form behavior

    const { lablePrice, itemCost, salePrice, wholesalePrice } = modalItem;
    if (
      parseFloat(lablePrice) < parseFloat(itemCost) ||
      parseFloat(itemCost) > parseFloat(salePrice) ||
      parseFloat(itemCost) > parseFloat(wholesalePrice)
    ) {
      showErrorAlert(
        "Invalid Price Configuration",
        "Ensure: Lable Price ≥ Cost, and Cost ≤ Sale & Wholesale Price",
      );
      return;
    }

    const requiredFields = [
      { key: "lablePrice", label: "Lable Price" },
      { key: "itemCost", label: "Cost" },
      { key: "salePrice", label: "Sale Price" },
      { key: "wholesalePrice", label: "Wholesale Price" },
      { key: "qty", label: "Quantity" },
    ];
    for (let field of requiredFields) {
      if (
        modalItem[field.key] === "" ||
        modalItem[field.key] === null ||
        modalItem[field.key] === undefined
      ) {
        showErrorAlert(`${field.label} is required`);
        return;
      }
    }
    if (!modalItem.itemCode) {
      showErrorAlert("Item code is required");
      return;
    }

    if (editIndex !== null) {
      // Update existing item
      const updatedItems = [...cartItems];
      updatedItems[editIndex] = modalItem;
      setCartItems(updatedItems);
      showSuccessAlert("Success", "Item updated in cart");
    } else {
      // Add new item
      setCartItems((prev) => [...prev, modalItem]);
      showSuccessAlert("Success", "Item added to cart");
    }

    setShowModal(false);
    setShowViewModal(false);
    setModalItem({});
    setEditIndex(null);
  };

  const openAddModalWithGRN = (grn: IViewGRNItem) => {
    setModalItem({
      itemCode: grn.item.code,
      description: grn.item.description,
      lablePrice: grn.lablePrice,
      itemCost: grn.itemCost,
      salePrice: grn.retailPrice,
      wholesalePrice: grn.wholesalePrice,
      customerDiscount: 0,
      wholesaleDiscount: 0,
      qty: "", // quantity to be entered by user
    });
    setSelectedGRN(grn.item);
    setEditIndex(null);
    setShowModal(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewGRN((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getSessionData("accessToken") || "";
      const userProfile = getSessionData("userProfile");

      // Map cartItems to itemGRNS correctly
      const itemGRNS = cartItems.map((item) => ({
        description: item.description || "",
        itemCode: item.itemCode || "",
        lablePrice: Number(item.lablePrice) || 0,
        itemCost: Number(item.itemCost) || 0,
        retailPrice: Number(item.salePrice) || 0,
        wholesalePrice: Number(item.wholesalePrice) || 0,
        retailDiscount: Number(item.customerDiscount) || 0,
        wholesaleDiscount: Number(item.wholesaleDiscount) || 0,
        qty: Number(item.qty) || 0,
        status: "ACTIVE",
      }));

      // Calculate totals
      const cost = totalAmount;
      const debitAmount = Number(paidAmount) || 0;
      const creditAmount = computedCredit;

      const response = await postLoginRequest(
        "api/v1/grn/add",
        {
          ...newGRN,
          itemGRNS,
          cost,
          debitAmount,
          creditAmount,
        },
        ADD,
        token,
        userProfile?.username,
      );

      if (response.success) {
        showSuccessAlert(
          "Success",
          response.message || "GRN item created successfully",
        );
        // Set data for print modal
        setPrintData({
          grnNo: response.data?.grnNo || "N/A",
          date: new Date(),
          location:
            locations.find((loc) => loc.code === newGRN.locationCode)
              ?.description || "N/A",
          supplier:
            suppliers.find((sup) => sup.code === newGRN.supplierId)
              ?.description || "N/A",
          paid: paidAmount,
          credit: computedCredit,
          total: totalAmount,
          items: cartItems,
        });

        setShowPrintModal(true);
        // fetchGRN();
        setNewGRN({
          supplierId: "",
          locationCode: "Warehouse",
          cost: 0,
          debitAmount: 0,
          creditAmount: 0,
          remark: "",
          dueDate: "",
          grnDate: "",
          itemGRNS: [
            {
              description: "",
              itemCode: "",
              lablePrice: 0,
              itemCost: 0,
              retailPrice: 0,
              wholesalePrice: 0,
              retailDiscount: 0,
              wholesaleDiscount: 0,
              qty: 0,
              status: "ACTIVE",
            },
          ],
        });
        setCartItems([]);
        setPaidAmount(0);
        setModalItem({});
        setEditIndex(null);
      } else {
        showErrorAlert(
          "GRN Create Failed",
          response.message || "Something went wrong!",
        );
      }
    } catch (err) {
      console.error("Error calling API:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.qty * item.itemCost,
    0,
  );

  // If no paid amount entered, show credit as full total
  const computedCredit =
    paidAmount === "" ? totalAmount : totalAmount - Number(paidAmount);

  const handlePaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const paidValue = e.target.value;
    if (paidValue === "") {
      setPaidAmount("");
    } else {
      setPaidAmount(parseFloat(paidValue));
    }
  };

  // Pagination logic

  const fetchGRN = async () => {
    try {
      setLoading(true);
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/grn/filter-list",
        { ...viewGRN },
        FILTERLIST,
        token,
        username,
      );

      if (response.success) {
        if (viewGRN.page === 0) {
          setGRNList(response.data.content || []);
        } else {
          setGRNList((prev) => [...prev, ...(response.data.content || [])]);
        }
        setTotalRecords(response.data.totalRecords || 0);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.getElementById("scrollable-table");
      if (
        scrollContainer &&
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 50 &&
        !isFetchingMore &&
        grnList.length < totalRecords
      ) {
        setIsFetchingMore(true);
        setViewGRN((prev) => ({
          ...prev,
          page: prev.page + 1,
        }));
      }
    };

    const scrollContainer = document.getElementById("scrollable-table");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [grnList, totalRecords, isFetchingMore]);

  // Short Keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showModal) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setShowModal(false);
      } else if (event.key === "Enter") {
        event.preventDefault();
        handleAddOrEditItem(new Event("submit") as any); // simulate form submit
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleAddOrEditItem]);

  useEffect(() => {
    fetchGRN();
  }, [viewGRN.search.keyword]);

  useEffect(() => {
    if (viewGRN.page > 0) {
      fetchGRN();
    }
  }, [viewGRN.page]);

  const handlePageChange = (newPage: number) => {
    setViewGRN((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // sorting logic

  const handleSort = (column: string) => {
    setViewGRN((prev) => ({
      ...prev,
      sortColumn: column,
      sortDirection:
        prev.sortColumn === column && prev.sortDirection === "ASC"
          ? "DESC"
          : "ASC",
    }));
  };

  // Pagination logic

  const renderSortIcons = (column: string) => {
    const isActive = viewGRN.sortColumn === column;
    const direction = viewGRN.sortDirection;

    return (
      <span className="ml-1 inline-block">
        <span
          className={`block ${
            isActive && direction === "ASC" ? "text-black" : "text-gray-400"
          }`}
        >
          <ChevronUp className="h-3 w-3 text-black" />
        </span>
        <span
          className={`block ${
            isActive && direction === "DESC" ? "text-black" : "text-gray-400"
          } -mt-1`}
        >
          <ChevronDown className="h-3 w-3 text-black" />
        </span>
      </span>
    );
  };

  // Filter logic

  const [selectedFilters, setSelectedFilters] = useState({
    keyword: "",
  });

  // inside your component before return
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setViewGRN((prev) => ({
        ...prev,
        page: 0,
        search: {
          ...prev.search,
          keyword: selectedFilters.keyword,
        },
      }));
    }, 400); // debounce duration

    return () => clearTimeout(debounceTimeout);
  }, [selectedFilters.keyword]);

  useEffect(() => {
    fetchGRN();
  }, []);

  // Modal logic

  const [showModal, setShowModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);

  // Filter logic

  const handleFilterChange = (field: string, value: string) => {
    setSelectedFilters({ ...selectedFilters, [field]: value });
  };

  // Apply filters and reset filters logic
  const applyFilters = () => {
    setCurrentPage(0);
    setViewGRN({
      ...viewGRN,
      page: 0,
      search: {
        ...selectedFilters,
      },
    });
  };

  const resetFilters = () => {
    const clearedFilters = { keyword: "" };
    setSelectedFilters(clearedFilters);
    setViewGRN({
      ...viewGRN,
      page: 0,
      search: clearedFilters,
    });
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchItemReferenceData();
  }, []);

  // Fetch reference data first before tasks
  const fetchItemReferenceData = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/item/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setDefaultStatus(response.data.defaultStatus || []);
        setBrands(response.data.brands || []);
        setCategories(response.data.categories || []);
        setUnits(response.data.units || []);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Add New Item
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = getSessionData("accessToken") || "";
      const userProfile = getSessionData("userProfile");
      const response = await postLoginRequest(
        "api/v1/item/add",
        {
          ...newItem,
        },
        ADD,
        token,
        userProfile?.username,
      );

      if (response.success) {
        showSuccessAlert(
          "Success",
          response.message || "Item created successfully",
        );
        setShowRegisterItemModal(false);
        // Reset form fields
        setNewItem({
          code: "",
          description: "",
          status: "",
          category: "",
          brand: "",
          unit: "",
        });
      } else {
        showErrorAlert(
          "Item Create Failed",
          response.message || "Something went wrong!",
        );
      }
    } catch (err) {
      console.error("Error calling API:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reference data first before sections
  const fetchReferenceData = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/grn/reference-data",
        {},
        REFDATA,
        token,
        username,
      );

      if (response.success) {
        setPrivileges(response.data.privileges || {});
        setDefaultStatus(response.data.defaultStatus || []);
        setSuppliers(response.data.suppliers || []);
        setLocations(response.data.locations || []);
        fetchGRN();
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Reference Data fetch error:", error);
    }
  };

  // Fetch sections logic

  // Handle view, edit, save, and delete section logic

  const handleViewGRN = async (itemCode: string) => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/grn/view",
        { itemCode },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        setSelectedViewGRN(response.data);
        setShowViewModal(true); // ← Show modal here
        console.log("Selected GRN:", response.data);
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("View error:", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";
      const response = await postLoginRequest(
        "api/v1/grn/update",
        selectedGRN,
        UPDATE,
        token,
        username,
      );

      if (response.success) {
        showSuccessAlert(
          "Successfully Updated",
          "Check & verify updated details.",
        );
        setSelectedViewGRN((prev) =>
          prev.map((grn) =>
            grn.id === selectedGRN.id ? { ...grn, ...selectedGRN } : grn,
          ),
        );
      } else {
        showErrorAlert(response.message);
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleActive = async (
    id: string,
    currentStatus: "ACTIVE" | "INACTIVE",
  ) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const token = getSessionData("accessToken") || "";
      const username = getSessionData("userProfile")?.username || "";

      const response = await postLoginRequest(
        "api/v1/grn/disable",
        { id, status: newStatus },
        VIEW,
        token,
        username,
      );

      if (response.success) {
        // 1. Update main list
        setGRNList((prevList) =>
          prevList.map((item) =>
            item.id.toString() === id ? { ...item, status: newStatus } : item,
          ),
        );

        // Update modal view list
        setSelectedViewGRN((prevList) =>
          prevList.map((item) =>
            item.id.toString() === id ? { ...item, status: newStatus } : item,
          ),
        );

        showSuccessAlert("Status Updated", `Item is now ${newStatus}`);
      } else {
        showErrorAlert(response.message || "Status update failed");
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  return (
    <>
      <div className="flex h-screen flex-col overflow-hidden md:flex-row">
        {/* Left Column */}
        <div className="flex w-full flex-col overflow-hidden p-4 md:w-1/2">
          <div className="flex grow flex-col overflow-hidden">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="me-2 inline-flex items-center rounded-full bg-primary p-2.5 text-center text-sm font-medium text-white hover:bg-hover focus:outline-none  dark:bg-primary dark:hover:bg-hover"
              >
                {/* Left Arrow Icon */}
                <svg
                  className="h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 5H1m0 0l4 4M1 5l4-4"
                  />
                </svg>
              </button>
              <div className="flex w-full items-center justify-between gap-2">
                <Link className="flex w-full" href="/grn/stock-magement">
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-90">
                    <ScanSearch className="h-4 w-4" />
                    View GRN
                  </button>
                </Link>

                <div className="relative w-full">
                  <select
                    className="h-full w-full appearance-none rounded-xl border bg-[#EAF4FE] p-2 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                    value={newGRN.locationCode}
                    name="locationCode"
                    onChange={(e) =>
                      setNewGRN({ ...newGRN, locationCode: e.target.value })
                    }
                  >
                    <option value="">Select Location</option>
                    {locations.map((location) => (
                      <option key={location.code} value={location.code}>
                        {location.description}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-gray-200 p-1 text-gray-500 dark:bg-gray-700 dark:text-gray-200" />
                </div>
              </div>
            </div>
            {privileges.search && (
              <div className="mb-4 mt-3 flex flex-col items-center gap-2 space-y-3 md:flex-row md:space-y-0">
                <div className="relative w-full flex-1 rounded-lg dark:border dark:border-gray-500 dark:bg-boxdark-2 md:w-auto">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 ">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    ref={searchInputRef}
                    placeholder="Search By Name / Code"
                    className="h-[40px] w-full rounded-lg p-2 pl-10 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                    value={selectedFilters.keyword}
                    onChange={(e) =>
                      setSelectedFilters({
                        ...selectedFilters,
                        keyword: e.target.value,
                      })
                    }
                  />
                  <span className="absolute inset-y-0 right-0 m-2 mr-1 items-center justify-center rounded-md bg-black-2 px-3 py-1 text-xs text-white">
                    F2
                  </span>
                </div>

                {/* <button
                  onClick={resetFilters}
                  className="h-[40px] rounded-lg border border-gray-500 bg-gray-500 px-4 py-1.5 text-sm font-medium text-white hover:border-gray-400 hover:bg-gray-400"
                >
                  Reset
                </button> */}

                <button
                  onClick={handleOpenAddModal}
                  className="flex h-[40px] items-center gap-2 rounded-xl border border-primary bg-primary px-4 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <PlusCircle className="h-4 w-4" />
                  Register Item
                </button>

                <button
                  onClick={() => {
                    setShowCategoryModal(true);
                  }}
                  className="flex h-[40px] items-center gap-2 rounded-xl border border-primary bg-primary px-4 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <FolderPlus className="h-4 w-4" />
                  Category
                </button>
              </div>
            )}

            <div className="grow overflow-hidden">
              <div
                id="scrollable-table"
                className="hide-scrollbar h-full overflow-y-auto rounded-xl"
              >
                <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4  dark:border-gray-700 dark:bg-gray-900">
                  {/* Header Row */}
                  <div className="sticky top-0 z-10 grid grid-cols-4 gap-4  border-gray-200 bg-white px-4 py-4 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    <div className="text-center">Action</div>
                    <div className="text-center">Name</div>
                    <div className="text-center">Code</div>
                    {/* <div className="text-center">Category</div>
                    <div className="text-center">Brand</div> */}
                    <div className="text-center">Status</div>
                  </div>

                  <div className="mt-2 cursor-pointer space-y-3">
                    {grnList.length === 0 ? (
                      <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                        No records found.
                      </div>
                    ) : (
                      grnList.map((item, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 items-center gap-y-2 rounded-xl border border-gray-100 bg-gray-50 p-2 text-center text-xs shadow-sm transition hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 md:grid-cols-4 md:gap-4"
                          onClick={() => {
                            setSelectedGRN(item);
                            setModalItem({
                              itemCode: item.code,
                              description: item.description,
                              lablePrice: "",
                              cost: "",
                              salePrice: "",
                              wholesalePrice: "",
                              customerDiscount: "",
                              wholesaleDiscount: "",
                              qty: "",
                            });
                            setEditIndex(null);
                            setShowModal(true);
                          }}
                        >
                          <div className="text-center text-gray-700 dark:text-gray-200 md:text-center">
                            {privileges.view && (
                              <button
                                className="rounded-full bg-blue-100 p-1.5 hover:bg-blue-200 dark:bg-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewGRN(item.code);
                                }}
                                title="View"
                              >
                                <ScanEye className="h-5 w-5 text-primary dark:text-white" />
                              </button>
                            )}
                          </div>
                          <div className="text-center text-gray-700 dark:text-gray-200 md:text-center">
                            {item.description}
                          </div>
                          <div className="text-center text-gray-700 dark:text-gray-200 md:text-center">
                            {item.code}
                          </div>

                          {/* <div className="text-center text-gray-700 dark:text-gray-200 md:text-center">
                            {item.category.description}
                          </div>
                          <div className="text-center text-gray-700 dark:text-gray-200 md:text-center">
                            {item.brand.description}
                          </div> */}
                          <div className="text-center text-gray-700 dark:text-gray-200 md:text-center">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                item.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {item.statusDescription}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex w-full flex-col overflow-hidden p-4 md:w-1/2">
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <div className="grow overflow-hidden">
              <div className="hide-scrollbar h-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
                <div className="w-full space-y-2 text-white">
                  {/* Table Header */}
                  <div className="mb-1 flex w-full items-center justify-between text-sm font-bold">
                    <div className="text-md w-[40%] px-2 text-primary">
                      Item Name
                    </div>
                    <div className="flex w-[60%] justify-between px-2 text-[12px]">
                      <span className="text-primary">Discount</span>
                      <span className="text-primary">Lable Price</span>
                      <span className="text-primary">Cost</span>
                      <span className="text-primary">Sale Price</span>
                      <span className="text-primary">Wholesale</span>
                      <span className="text-primary">Quantity</span>
                    </div>
                  </div>

                  {/* Table Body */}
                  {cartItems.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
                      No items added
                    </div>
                  ) : (
                    cartItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex w-full justify-between gap-2 rounded-3xl border border-gray-200 bg-white p-2  dark:border-gray-500 dark:bg-gray-800"
                      >
                        {/* Left: Description & Code */}
                        <div className="flex w-[40%] flex-col justify-center rounded-2xl border bg-white px-3 py-2 dark:border-gray-500 dark:bg-gray-800">
                          <p className="text-sm font-medium text-black dark:text-white">
                            {index + 1}. {item.description} - {item.qty}
                          </p>
                          <p className="text-sm font-bold text-primary">
                            {item.itemCode}
                          </p>
                        </div>

                        {/* Right: Prices, QTY, Actions */}
                        <div className="flex w-[60%] flex-col justify-between rounded-2xl border border-gray-200  bg-white p-2 px-3 py-2 text-right text-sm  dark:border-gray-500 dark:bg-gray-800">
                          {/* Prices & Quantity Row */}
                          <div className="flex justify-between text-sm font-bold">
                            <span className="text-red-500 dark:text-red-400">
                              {item.lablePrice > 0
                                ? `${(((item.lablePrice - item.itemCost) / item.lablePrice) * 100).toFixed(2)}%`
                                : "0.00%"}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {item.lablePrice?.toFixed(2)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {item.itemCost?.toFixed(2)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {item.salePrice?.toFixed(2)}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {item.wholesalePrice?.toFixed(2)}
                            </span>
                            <span className="text-primary">{item.qty}</span>
                          </div>

                          {/* Total */}
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-[18px] font-bold text-gray-500 dark:text-gray-300">
                              Total : {(item.qty * item.itemCost).toFixed(2)}
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setModalItem(item);
                                  setEditIndex(index);
                                  setShowModal(true);
                                }}
                                className="flex items-center gap-1  rounded-full bg-blue-100 p-2 text-sm text-blue-500 hover:bg-blue-200 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const updated = cartItems.filter(
                                    (_, i) => i !== index,
                                  );
                                  setCartItems(updated);
                                }}
                                className="flex items-center gap-1  rounded-full bg-red-100 p-2 text-sm text-red-500 hover:bg-red-200 dark:bg-red-500 dark:text-white dark:hover:bg-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 space-y-0">
              {/* Bill Summary */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="mb-2 flex w-full flex-col gap-2">
                  {/* GRN TO Banner */}
                  <div className="flex h-[40px] w-full items-center gap-2 rounded-xl border border-primary bg-primary px-4 text-sm font-medium text-white">
                    <House className="h-4 w-4" />
                    GRN TO:{" "}
                    {locations.find((loc) => loc.code === newGRN.locationCode)
                      ?.description ?? "N/A"}
                  </div>

                  {/* Supplier Dropdown */}
                  <div className="relative h-[40px] w-full">
                    <select
                      className="h-full w-full appearance-none rounded-xl border bg-[#EAF4FE] p-2 pr-10 focus:outline-none dark:border-gray-500 dark:bg-boxdark-2"
                      value={newGRN.supplierId}
                      name="supplierId"
                      required
                      onChange={(e) =>
                        setNewGRN({ ...newGRN, supplierId: e.target.value })
                      }
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((sup) => (
                        <option key={sup.code} value={sup.code}>
                          {sup.description}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-gray-200 p-1 text-gray-500 dark:bg-gray-700 dark:text-gray-200" />
                  </div>
                </div>

                <div className="w-full rounded-xl bg-[#EAF6FE] px-4 py-2 text-right text-sm font-bold dark:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-secondary dark:text-gray-300">Paid</p>
                    <input
                      type="number"
                      id="paid"
                      value={paidAmount}
                      onChange={handlePaidChange}
                      className="no-spinner w-32 rounded-xl border bg-white p-2 text-right font-semibold text-gray-900 transition-all duration-200 focus:outline-none dark:border-gray-500 dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-secondary dark:text-gray-300">Credit</p>
                    <span className="text-gray-500 dark:text-gray-400">
                      {computedCredit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pb-2 sm:flex-row">
                <input
                  className="w-full resize-y rounded-xl border border-gray-200 bg-white  p-3 text-gray-500 placeholder-gray-500 transition-all duration-200 focus:outline-none dark:border-gray-500 dark:bg-gray-900 dark:text-gray-200 dark:placeholder-gray-300"
                  placeholder="Type Remarks Here"
                  name="remark"
                  value={newGRN.remark}
                  onChange={handleChange}
                />
                <div className="text-md flex w-full items-center justify-between gap-2 rounded-xl border-t border-dashed bg-[#EAF4FE] px-4 py-3 font-bold text-secondary dark:bg-gray-700">
                  <p className="text-base font-bold text-secondary dark:text-gray-300">
                    Total
                  </p>
                  <span className="text-xl text-black dark:text-gray-200">
                    {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <button className="text-md flex w-full items-center justify-center gap-2 rounded-xl bg-red-100 py-3 font-bold text-red-500 dark:bg-red-500 dark:text-white">
                  <CircleX className="cursor-pointer text-red-500 dark:text-white" />
                  Cancel Sale
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="text-md flex w-full items-center justify-center gap-2 rounded-xl bg-[#4FB7E4] py-3 font-bold text-white"
                >
                  <Save className="cursor-pointer text-white" />
                  {loading ? "SAVING..." : "SAVE GRN"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {showModal && selectedGRN && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black  bg-opacity-50">
          <div className="relative m-2 w-[90%] max-w-xl rounded-3xl bg-white p-6 text-gray-600 shadow-lg dark:border dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
            {/* Close Icon Top-Right */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="mb-2 text-center text-xl font-semibold">
              {selectedGRN.description}
            </h2>
            <p className="mb-4 text-center text-sm">
              <strong>Item Code :</strong>{" "}
              <span className="font-semibold text-primary">
                {" "}
                {selectedGRN.code}
              </span>
            </p>
            <hr className="dark:border-gray-500" />
            <form>
              <div className="mb-4 mt-4">
                <div className="flex-col justify-center">
                  <div className="ustify-between flex w-full gap-4">
                    <div className="w-1/2">
                      <strong>Lable Price</strong>
                      <input
                        type="number"
                        name="lablePrice"
                        required
                        value={modalItem.lablePrice}
                        onChange={handleModalInputChange}
                        className="mb-2 mt-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      />
                    </div>
                    <div className="w-1/2">
                      <strong>Cost</strong>
                      <input
                        type="number"
                        name="itemCost"
                        required
                        value={modalItem.itemCost}
                        onChange={handleModalInputChange}
                        className="mb-2 mt-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex w-full justify-between gap-4">
                    <div className="w-1/2">
                      <strong>Sale Price</strong>
                      <input
                        type="number"
                        name="salePrice"
                        required
                        value={modalItem.salePrice}
                        onChange={handleModalInputChange}
                        className="mb-2 mt-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      />
                    </div>
                    <div className="w-1/2">
                      <strong>Wholesale Price</strong>
                      <input
                        type="number"
                        name="wholesalePrice"
                        required
                        value={modalItem.wholesalePrice}
                        onChange={handleModalInputChange}
                        className="mb-2 mt-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      />
                    </div>
                  </div>
                  {/* <div className="flex w-full justify-between gap-4">
                    <div className="w-1/2">
                      <strong>Customer Discount (%)</strong>
                      <input
                        type="number"
                        name="customerDiscount"
                        value={modalItem.customerDiscount}
                        onChange={handleModalInputChange}
                        className="mb-2 mt-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      />
                    </div>
                    <div className="w-1/2">
                      <strong>Wholesale Discount (%)</strong>
                      <input
                        type="number"
                        name="wholesaleDiscount"
                        value={modalItem.wholesaleDiscount}
                        onChange={handleModalInputChange}
                        className="mb-2 mt-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      />
                    </div>
                  </div> */}
                  <div className="flex w-full justify-between gap-4">
                    <div className="w-full">
                      <strong>Quantity</strong>
                      <input
                        type="number"
                        name="qty"
                        required
                        value={modalItem.qty}
                        onChange={handleModalInputChange}
                        className="mb-2 mt-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex  gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="text-md mt-4 w-full rounded-2xl bg-gray-400 px-4 py-3 font-bold text-white hover:bg-gray-500"
                >
                  Cancel{" "}
                  <span className="ml-2 inline rounded-lg bg-black-2 p-1 px-2 text-xs">
                    Esc
                  </span>
                </button>
                <button
                  onClick={handleAddOrEditItem}
                  className="text-md mt-4 w-full rounded-2xl bg-primary px-4 py-3 font-bold text-white hover:bg-hover"
                >
                  {editIndex !== null ? "Update" : "Add"}{" "}
                  <span className="ml-2 inline rounded-lg bg-black-2 p-1 px-2 text-xs">
                    Enter
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showViewModal && selectedViewGRN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative m-2 w-full max-w-5xl rounded-3xl bg-white p-6 text-gray-600 shadow-lg dark:border dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
            {/* Close Icon Top-Right */}
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="mb-4 text-xl font-bold text-primary">
              {selectedViewGRN[0]?.item?.description}
            </h2>

            <div className="overflow-x-auto">
              <div className="hide-scrollbar max-h-150 overflow-hidden overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-700">
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-center">Location</th>
                      <th className="px-4 py-2 text-center">Discount</th>
                      <th className="px-4 py-2 text-center">Label Price</th>
                      <th className="px-4 py-2 text-center">Cost</th>
                      <th className="px-4 py-2 text-center">Sale</th>
                      <th className="px-4 py-2 text-center">Whole Sale</th>
                      <th className="px-4 py-2 text-center">QTY</th>
                      <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {selectedViewGRN.map((grn, index) => (
                      <tr
                        key={index}
                        onClick={(e) => {
                          // prevent click if inside a button
                          const target = e.target as HTMLElement;
                          if (target.closest("button")) return;
                          openAddModalWithGRN(grn);
                        }}
                        className="cursor-pointer bg-white text-center dark:bg-gray-800"
                      >
                        <td className="px-4 py-2">
                          {grn.location.description || "Unknown"}
                        </td>
                        <td className="px-4 py-2">
                          {grn.lablePrice > 0
                            ? `${(((grn.lablePrice - grn.itemCost) / grn.lablePrice) * 100).toFixed(2)}%`
                            : "0.00%"}
                        </td>
                        <td className="px-4 py-2">
                          {grn.lablePrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">{grn.itemCost.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          {grn.retailPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          {grn.wholesalePrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">{grn.qty}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGRN(grn);
                                setEditModalVisible(true);
                              }}
                              className="w-full rounded-lg  bg-lime-600 px-4 py-1 text-xs text-white hover:bg-lime-700"
                            >
                              Edit Stock
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActive(
                                  grn.id.toString(),
                                  grn.status as "ACTIVE" | "INACTIVE",
                                );
                              }}
                              className={`w-full rounded-lg px-2 py-1 text-xs text-white transition-colors duration-200 ${
                                grn.status === "ACTIVE"
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-red-500 hover:bg-red-600"
                              }`}
                            >
                              {grn.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 text-center font-semibold dark:bg-gray-900">
                    <tr>
                      <td className="px-4 py-2">Sub Total</td>
                      <td className="px-4 py-2"></td>
                      <td className="px-4 py-2">
                        {selectedViewGRN
                          .reduce((sum, g) => sum + g.lablePrice, 0)
                          .toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {selectedViewGRN
                          .reduce((sum, g) => sum + g.itemCost, 0)
                          .toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {selectedViewGRN
                          .reduce((sum, g) => sum + g.retailPrice, 0)
                          .toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {selectedViewGRN
                          .reduce((sum, g) => sum + g.wholesalePrice, 0)
                          .toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        {selectedViewGRN.reduce((sum, g) => sum + g.qty, 0)}
                      </td>
                      <td className="px-4 py-2 text-blue-600 dark:text-blue-400">
                        Profit:{" "}
                        {selectedViewGRN
                          .reduce(
                            (sum, g) =>
                              sum +
                              ((g.retailPrice || 0) - (g.itemCost || 0)) *
                                (g.qty || 0),
                            0,
                          )
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="rounded-xl bg-gray-400 px-6 py-2 text-white hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {editModalVisible && selectedGRN && (
        <div className="fixed inset-0 z-50 flex  items-center justify-center bg-black bg-opacity-50">
          <div className="relative m-2 w-full max-w-md rounded-3xl bg-white p-6 text-gray-600 shadow-lg dark:border dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
            {/* Close Icon Top-Right */}
            <button
              onClick={() => setEditModalVisible(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="mb-4 text-lg font-semibold text-primary">
              Edit GRN Stock
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-200">
                  Lable Price
                </label>
                <input
                  type="number"
                  value={selectedGRN.lablePrice}
                  onChange={(e) =>
                    setSelectedGRN({
                      ...selectedGRN,
                      lablePrice: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 dark:border-gray-500 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-200">
                  Item Cost
                </label>
                <input
                  type="number"
                  value={selectedGRN.itemCost}
                  onChange={(e) =>
                    setSelectedGRN({
                      ...selectedGRN,
                      itemCost: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 dark:border-gray-500 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-200">
                  Sale Price
                </label>
                <input
                  type="number"
                  value={selectedGRN.retailPrice}
                  onChange={(e) =>
                    setSelectedGRN({
                      ...selectedGRN,
                      retailPrice: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 dark:border-gray-500 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-200">
                  Wholesale Price
                </label>
                <input
                  type="number"
                  value={selectedGRN.wholesalePrice}
                  onChange={(e) =>
                    setSelectedGRN({
                      ...selectedGRN,
                      wholesalePrice: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 dark:border-gray-500 dark:bg-gray-900 dark:text-white"
                />
              </div>
              {/* <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-200">
                  Retail Discount
                </label>
                <input
                  type="number"
                  value={selectedGRN.retailDiscount}
                  onChange={(e) =>
                    setSelectedGRN({
                      ...selectedGRN,
                      retailDiscount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 dark:border-gray-500 dark:bg-gray-900 dark:text-white"
                />
              </div> */}
              {/* <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-200">
                  Wholesale Discount
                </label>
                <input
                  type="number"
                  value={selectedGRN.wholesaleDiscount}
                  onChange={(e) =>
                    setSelectedGRN({
                      ...selectedGRN,
                      wholesaleDiscount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 dark:border-gray-500 dark:bg-gray-900 dark:text-white"
                />
              </div> */}
              <div>
                <label className="mb-2 block text-gray-700 dark:text-gray-200">
                  Quantity
                </label>
                <input
                  type="number"
                  value={selectedGRN.qty}
                  onChange={(e) =>
                    setSelectedGRN({
                      ...selectedGRN,
                      qty: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border px-3 py-2 dark:border-gray-500 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setEditModalVisible(false)}
                className="w-full rounded-xl bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (selectedGRN) {
                    await handleSaveEdit(); // Wait for update
                    setEditModalVisible(false); // Then close
                  }
                }}
                className="w-full rounded-xl bg-primary px-4 py-2 text-white hover:bg-hover"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Item  */}
      {showRegisterItemModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative m-2 w-full max-w-md rounded-3xl bg-white p-6 text-gray-600 shadow-lg dark:border dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
            {/* Close Icon Top-Right */}
            <button
              onClick={() => setShowRegisterItemModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="mb-4 text-lg font-semibold">Add New Item</h2>
            <form onSubmit={handleItemSubmit}>
              <input
                type="text"
                placeholder="Item Code"
                name="code"
                onChange={handleItemChange}
                required
                pattern="^\S+$"
                className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                value={newItem.code}
              />
              <input
                type="text"
                placeholder="Name"
                name="description"
                required
                className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                value={newItem.description}
                onChange={handleItemChange}
              />
              <div className="relative">
                <select
                  className="mb-2 w-full appearance-none rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newItem.category}
                  name="category"
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.code} value={category.code}>
                      {category.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>
              <div className="relative">
                <select
                  className="mb-2 w-full appearance-none rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newItem.brand}
                  name="brand"
                  onChange={(e) =>
                    setNewItem({ ...newItem, brand: e.target.value })
                  }
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.code} value={brand.code}>
                      {brand.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>
              <div className="relative">
                <select
                  className="mb-2 w-full appearance-none rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newItem.unit}
                  name="unit"
                  onChange={(e) =>
                    setNewItem({ ...newItem, unit: e.target.value })
                  }
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit.code} value={unit.code}>
                      {unit.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>

              <div className="relative mb-4">
                <select
                  className="w-full appearance-none rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newItem.status}
                  name="status"
                  onChange={(e) =>
                    setNewItem({ ...newItem, status: e.target.value })
                  }
                >
                  <option value="">Select Status</option>
                  {defaultStatus.map((status) => (
                    <option key={status.code} value={status.code}>
                      {status.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>
              <div className="flex  gap-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary px-4 py-2 text-sm text-white hover:bg-hover"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterItemModal(false)}
                  className="w-full rounded-xl bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative m-2 w-full max-w-md rounded-3xl bg-white p-6 text-gray-600 shadow-lg dark:border dark:border-gray-500 dark:bg-gray-800 dark:text-gray-300">
            {/* Close Icon Top-Right */}
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-red-500"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="mb-4 text-lg font-semibold">Add New Category</h2>
            <form onSubmit={handleCategorySubmit}>
              <input
                type="text"
                placeholder="Category Code"
                name="code"
                onChange={handleCategoryChange}
                required
                pattern="^\S+$"
                className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                value={newCategory.code}
              />
              <input
                type="text"
                placeholder="Name"
                name="description"
                required
                className="mb-2 w-full rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                value={newCategory.description}
                onChange={handleCategoryChange}
              />

              <div className="relative">
                <select
                  className="mb-2 w-full appearance-none rounded-lg border px-3 py-2 focus:outline-none dark:border-gray-500 dark:bg-gray-900"
                  value={newCategory.status}
                  name="status"
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, status: e.target.value })
                  }
                >
                  <option value="">Select Status</option>
                  {defaultStatus.map((status) => (
                    <option key={status.code} value={status.code}>
                      {status.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              </div>

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary px-4 py-2 text-sm text-white hover:bg-hover"
                >
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="w-full rounded-xl bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showPrintModal && printData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div
            id="invoice-content"
            className="hide-scrollbar h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-lg dark:text-gray-800 print:h-auto print:min-h-screen print:max-w-full print:rounded-none print:p-6 print:shadow-none"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <img
                  src={"/admin/images/dpd.png"}
                  alt="Logo"
                  className="h-16 w-auto object-contain"
                />
                <div className="mt-2 text-xl font-bold">DPD Chemical</div>
                <div className="text-sm text-gray-600">
                  Pemaduwa, Anuradhapura
                </div>
                <div className="text-sm text-gray-600">
                  078 6065410 / 025 3133969
                </div>
                <div className="text-sm text-gray-600">
                  nimeshkalharapk@gmail.com
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">GRN INVOICE</div>
                <div className="text-sm text-gray-600">
                  {printData.date.toLocaleDateString()}{" "}
                  {printData.date.toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-600">
                  GRN NO : {printData.grnNo}
                </div>
              </div>
            </div>

            {/* BILL TO / SHIP TO */}
            <div className="mt-4 flex justify-between text-sm">
              <div>
                <div className="font-semibold">BILL TO</div>
                <div>{printData.supplier}</div>
                <div>{printData.location}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">SHIP TO</div>
                <div>{printData.location}</div>
              </div>
            </div>

            {/* ITEM TABLE */}
            <table className="mt-6 w-full table-auto border-collapse overflow-hidden text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-1">#</th>
                  {/* <th className="border px-2 py-1">Code</th> */}
                  <th className="border px-2 py-2.5">Item</th>
                  <th className="border px-2 py-2.5">Qty</th>
                  <th className="border px-2 py-2.5">Cost</th>
                  <th className="border px-2 py-2.5">Label</th>
                  <th className="border px-2 py-2.5">Retail</th>
                  <th className="border px-2 py-2.5">Wholesale</th>
                  <th className="border px-2 py-2.5">Discount</th>
                  <th className="border px-2 py-2.5">Total</th>
                </tr>
              </thead>
              <tbody>
                {printData.items.map((item: any, index: number) => (
                  <tr key={index} className="text-center">
                    <td className="border px-2 py-2.5">{index + 1}</td>
                    {/* <td className="border px-2 py-2.5">{item.itemCode}</td> */}
                    <td className="border px-2 py-2.5">{item.description}</td>
                    <td className="border px-2 py-2.5">{item.qty}</td>
                    <td className="border px-2 py-2.5">
                      {item.itemCost.toFixed(2)}
                    </td>
                    <td className="border px-2 py-2.5">
                      {item.lablePrice.toFixed(2)}
                    </td>
                    <td className="border px-2 py-2.5">
                      {item.salePrice.toFixed(2)}
                    </td>
                    <td className="border px-2 py-2.5">
                      {item.wholesalePrice.toFixed(2)}
                    </td>
                    <td className="border px-2 py-2.5">
                      {item.lablePrice > 0
                        ? `${(((item.lablePrice - item.itemCost) / item.lablePrice) * 100).toFixed(2)}%`
                        : "0.00%"}
                    </td>
                    <td className="border px-2 py-2.5">
                      {(item.itemCost * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTAL SUMMARY */}
            <div className="mt-4 flex justify-end text-sm">
              <table className="text-right">
                <tbody>
                  <tr>
                    <td className="pr-4">Subtotal :</td>
                    <td>Rs. {printData.total.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Paid :</td>
                    <td>Rs. {printData.paid || "0.00"}</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Discount :</td>
                    <td>Rs. 0.00</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Tax :</td>
                    <td>Rs. 0.00</td>
                  </tr>
                  <tr>
                    <td className="pr-4">Shipping :</td>
                    <td>Rs. 0.00</td>
                  </tr>
                  <tr className="text-lg font-bold text-primary">
                    <td className="pr-4">Balance Due :</td>
                    <td>Rs. {printData.credit.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SIGNATURE AREA */}
            <div className="mt-12 text-sm text-gray-600 print:mt-24">
              <div className="w-1/2">
                <div className="w-48 border-t border-black pt-2">
                  Authorized Signature
                </div>
                <div className="mt-4 text-xs">
                  Date: __________________________
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="no-pdf mt-6 flex justify-end gap-2 print:hidden">
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-40 rounded-2xl bg-gray-400 px-4 py-2 text-white hover:bg-opacity-80"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="w-40 rounded-2xl bg-primary px-4 py-2 text-white hover:bg-hover"
              >
                Print
              </button>
              <button
                onClick={handleDirectDownloadPDF}
                className="w-40 rounded-2xl bg-hover px-4 py-2 text-white hover:bg-primary"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default withAuth(NewGRN);
