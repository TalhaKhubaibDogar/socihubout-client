import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useFormik } from "formik";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import styles from './CandyModal.module.css';

export default function CandyModal({ open, setOpen }) {
  const [loading, setLoading] = useState(false);

  const RonaldoForm = useFormik({
    initialValues: {
      price: 20,
    },
    onSubmit: async (values) => {
        console.log(values);
      setLoading(true);
      try {
        const response = await axios.post(
          "/api/CandyPaymentLink",
          values.price
        );
        console.log(response?.data?.url?.url);
        window.open(response?.data?.url?.url, "_parent");
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    },
  });

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className={styles.modalDialog} onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter={styles.backdropTransitionEnter}
          enterFrom={styles.backdropStart}
          enterTo={styles.backdropEnd}
          leave={styles.backdropTransitionLeave}
          leaveFrom={styles.backdropTransitionLeaveStart}
          leaveTo={styles.backdropTransitionLeaveEnd}
        >
          <div className={styles.backdrop} />
        </Transition.Child>
        <div className={styles.modalContainer}>
          <div className={styles.modalPosition}>
            <Transition.Child
              as={Fragment}
              enter={styles.modalTransitionEnter}
              enterFrom={styles.modalStart}
              enterTo={styles.modalEnd}
              leave={styles.modalTransitionLeave}
              leaveFrom={styles.modalTransitionLeaveStart}
              leaveTo={styles.modalTransitionLeaveEnd}
            >
              <Dialog.Panel className={styles.modalPanel}>
                <div className={styles.modalClose}>
                  <button
                    type="button"
                    className={styles.closeButton}
                    onClick={() => setOpen(false)}
                  >
                    {/* <span className="sr-only">Close</span> */}
                    <XMarkIcon className={styles.iconSize} aria-hidden="true" />
                  </button>
                </div>
                <div className={styles.formContainer}>
                  <form
                    className={styles.priceForm}
                    onSubmit={RonaldoForm.handleSubmit}
                  >
                    <label htmlFor="price" className={styles.priceLabel}>
                      Select Price:
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      className={styles.priceInput}
                      value={RonaldoForm.values.price}
                      onChange={RonaldoForm.handleChange}
                      required
                      readOnly
                    />
                    <div className={styles.submitArea}>
                      <button
                        type="submit"
                        className={styles.submitButton}
                      >
                        {loading ? <ClipLoader size={20} color="#fff" /> : "Pay"}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
