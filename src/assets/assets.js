import logo from './logo.png'
import add_icon from './add_icon.png'
import order_icon from './order_icon.png'
import profile_image from './profile_image.png'
import upload_area from './upload_area.png'
import parcel_icon from './parcel_icon.png'

export const assets ={
    logo,
    add_icon,
    order_icon,
    profile_image,
    upload_area,
    parcel_icon
}

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const url = (() => {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  const resolvedUrl = configuredUrl || "http://localhost:4000";
  return trimTrailingSlash(resolvedUrl);
})();
